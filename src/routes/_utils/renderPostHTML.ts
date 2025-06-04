import { escapeRegExp } from './escapeRegExp.js'
import { getEmojiRegex } from './emojiRegex.ts'
import {
  DefaultTreeAdapterMap,
  defaultTreeAdapter,
  html,
  parseFragment,
  serialize,
} from 'parse5'
import { Mention } from './types.ts'
import {
  normalizeHashtag,
  localeAwareInclude,
} from '../_workers/processContent/hashtagBar.ts'

const {
  NS: { HTML },
} = html

function isNodeLinkHashtag(element: DefaultTreeAdapterMap['element']): boolean {
  if (element.tagName === 'a') {
    const c = element.attrs.find((attr) => /*  */ attr.name === 'class')
    const r = element.attrs.find((attr) => attr.name === 'rel')
    const h = element.attrs.find((attr) => attr.name === 'href')
    return (
      !!c?.value.split(/\s+/g).includes('hashtag') ||
      !!r?.value.split(/\s+/g).includes('tag') ||
      !!h?.value?.match(/\/tags\/[^\/]+$|\/search\?tag=/) // GtS and Friendica, respectively
    )
  }
  return false
}

function textContent(node: DefaultTreeAdapterMap['parentNode']): string[] {
  let text = []
  for (const child of node.childNodes) {
    if (defaultTreeAdapter.isTextNode(child)) {
      text.push(child.value)
    } else if ('childNodes' in child) {
      text.push(...textContent(child))
    }
  }
  return text
}

const isValidHashtagNode = (
  node: DefaultTreeAdapterMap['node'],
  normalizedTagNames: string[],
) => {
  if (!node) {
    return false
  }
  let text: string
  if (
    defaultTreeAdapter.isElementNode(node) &&
    isNodeLinkHashtag(node) &&
    (text = textContent(node).join(''))
  ) {
    const normalized = normalizeHashtag(text)
    if (!localeAwareInclude(normalizedTagNames, normalized)) {
      // stop here, this is not a real hashtag, so consider it as text
      return false
    }
    return normalized
  } else if (!defaultTreeAdapter.isTextNode(node) || node.value.trim()) {
    // not a space
    return false
  } else {
    // spaces
    return true
  }
}

const empty = new Map()

/* eslint no-constant-condition:0 */
const findEndOfMath = function (
  delimiter: string,
  text: string,
  startIndex: number,
) {
  // Adapted from
  // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
  let index = startIndex
  let braceLevel = 0

  const delimLength = delimiter.length

  while (index < text.length) {
    const character = text[index]

    if (
      braceLevel <= 0 &&
      text.slice(index, index + delimLength) === delimiter
    ) {
      return index
    } else if (character === '\\') {
      index++
    } else if (character === '{') {
      braceLevel++
    } else if (character === '}') {
      braceLevel--
    }

    index++
  }

  return -1
}

const escapeRegex = function (string: string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

const amsRegex = /^\\begin{/

const delimiters = [
  { left: '$$', right: '$$', display: true },
  { left: '\\(', right: '\\)', display: false },
  // LaTeX uses $…$, but it ruins the display of normal `$` in text:
  // {left: "$", right: "$", display: false},
  // $ must come after $$

  // Render AMS environments even if outside $$…$$ delimiters.
  { left: '\\begin{equation}', right: '\\end{equation}', display: true },
  { left: '\\begin{align}', right: '\\end{align}', display: true },
  { left: '\\begin{alignat}', right: '\\end{alignat}', display: true },
  { left: '\\begin{gather}', right: '\\end{gather}', display: true },
  { left: '\\begin{CD}', right: '\\end{CD}', display: true },

  { left: '\\[', right: '\\]', display: true },
]

const splitAtDelimiters = function (text: string) {
  let index
  const data = []

  const regexLeft = new RegExp(
    '(' + delimiters.map((x) => escapeRegex(x.left)).join('|') + ')',
  )

  while (true) {
    index = text.search(regexLeft)
    if (index === -1) {
      break
    }
    if (index > 0) {
      data.push({
        type: 'text',
        data: text.slice(0, index),
      })
      text = text.slice(index) // now text starts with delimiter
    }
    // ... so this always succeeds:
    const i = delimiters.findIndex((delim) => text.startsWith(delim.left))
    index = findEndOfMath(
      delimiters[i]!.right,
      text,
      delimiters[i]!.left.length,
    )
    if (index === -1) {
      break
    }
    const rawData = text.slice(0, index + delimiters[i]!.right.length)
    const math = amsRegex.test(rawData)
      ? rawData
      : text.slice(delimiters[i]!.left.length, index)
    data.push({
      type: 'math',
      data: math,
      rawData,
      display: delimiters[i]!.display,
    })
    text = text.slice(index + delimiters[i]!.right.length)
  }

  if (text !== '') {
    data.push({
      type: 'text',
      data: text,
    })
  }

  return data
}

export function renderPostHTMLToDOM({
  content,
  tags,
  autoplayGifs,
  emojis,
  mentionsByURL = empty,
  mentionsByAcct = empty,
  hasQuote,
}: {
  content: string
  tags: Array<{ name: string }>
  autoplayGifs: boolean
  emojis: Map<string, { url: string; static_url?: string; shortcode: string }>
  mentionsByURL?: Map<string, Mention>
  mentionsByAcct?: Map<string, Mention>
  hasQuote: boolean
}): DefaultTreeAdapterMap['parentNode'] {
  if (!content) {
    return defaultTreeAdapter.createDocumentFragment()
  }
  const normalizedTagNames: string[] = tags
    ? tags.map((tag: any) => tag.name.normalize('NFKC'))
    : []
  const dom = parseFragment(content)
  const customEmoji = [...emojis.keys()].map((e) => escapeRegExp(e)).join('|')
  const unicodeEmoji = getEmojiRegex().source
  const part = new RegExp(
    `:(${customEmoji}):|(${unicodeEmoji})|([\\s\\S])`,
    'g',
  )
  function handleTextNode(node: DefaultTreeAdapterMap['textNode']): void {
    const newNodes = []
    for (const [, customEmoji, unicodeEmoji, text] of node.value.matchAll(
      part,
    )) {
      if (text) {
        const lastNode: unknown = newNodes[newNodes.length - 1]
        if (typeof lastNode === 'string') {
          newNodes[newNodes.length - 1] = lastNode + text
        } else {
          newNodes.push(text)
        }
      } else if (customEmoji) {
        const emoji = emojis.get(customEmoji)
        if (emoji == null) {
          newNodes.push(`:${customEmoji}:`)
        } else {
          const urlToUse = autoplayGifs ? emoji.url : emoji.static_url ?? emoji.url;
          const shortcodeWithColons = `:${emoji.shortcode}:`
          const ele = defaultTreeAdapter.createElement('img', HTML, [
            { name: 'class', value: 'inline-custom-emoji' },
            { name: 'draggable', value: 'false' },
            { name: 'src', value: urlToUse },
            { name: 'alt', value: shortcodeWithColons },
            { name: 'title', value: shortcodeWithColons },
          ])
          newNodes.push(ele)
        }
      } else if (unicodeEmoji) {
        const ele = defaultTreeAdapter.createElement('span', HTML, [
          { name: 'class', value: 'inline-emoji' },
        ])
        defaultTreeAdapter.insertText(ele, unicodeEmoji)
        newNodes.push(ele)
      }
    }
    const frag = defaultTreeAdapter.createDocumentFragment()
    for (let text of newNodes) {
      if (typeof text === 'string') {
        for (const part of splitAtDelimiters(text)) {
          if (part.type === 'text') {
            defaultTreeAdapter.insertText(frag, part.data)
          } else {
            const codeElement = defaultTreeAdapter.createElement(
              part.display ? 'pre' : 'code',
              HTML,
              [{ name: 'class', value: 'to-katexify' }],
            )
            defaultTreeAdapter.insertText(codeElement, part.data)
            defaultTreeAdapter.appendChild(frag, codeElement)
          }
        }
      } else {
        defaultTreeAdapter.appendChild(frag, text)
      }
    }
    for (const child of frag.childNodes) {
      defaultTreeAdapter.insertBefore(
        node.parentNode as DefaultTreeAdapterMap['parentNode'],
        child,
        node,
      )
    }
    defaultTreeAdapter.detachNode(node)
  }
  function handleAnchorNode(anchor: DefaultTreeAdapterMap['element']): void {
    let c = anchor.attrs.find((attr) => attr.name === 'class')
    if (c == null) c = { name: 'class', value: '' }
    const href = anchor.attrs.find((attr) => attr.name === 'href')
    let rel = anchor.attrs.find((attr) => attr.name === 'rel')
    if (rel == null) rel = { name: 'rel', value: '' }
    const classList = c.value.split(/\s+/g)
    anchor.attrs = [c, rel]
    if (href != null) {
      anchor.attrs.push(href)
    }
    if (!href || /^#/.test(href.value)) {
      anchor.attrs = []
      anchor.tagName = 'span'
      anchor.nodeName = 'span'
      return
    }
    const index = anchor.parentNode?.childNodes.indexOf(anchor)
    const previousSibling = anchor.parentNode?.childNodes[(index || 0) - 1]
    let isFriendica
    let tag: string | boolean
    if (
      href != null &&
      (tag = isValidHashtagNode(anchor, normalizedTagNames)) &&
      typeof tag === 'string'
    ) {
      isFriendica = href.value.includes('/search?tag=')
      const wafrnMatch = href.value.match(/\/dashboard\/search\/([^\/]+)$/)
      const wafrnTag = wafrnMatch
        ? decodeURIComponent(wafrnMatch[1]!)
        : undefined
      if (isFriendica) {
        isFriendica = false
        if (
          previousSibling &&
          defaultTreeAdapter.isTextNode(previousSibling) &&
          previousSibling.value.endsWith('#')
        ) {
          isFriendica = true
        }
      }
      href.value = `/tags/${encodeURIComponent(tag)}`
      c.value = 'hashtag'
      rel.value = 'nofollow noopener ugc tag'
      anchor.attrs.push({
        name: 'data-tag',
        value: tag,
      })
      if (wafrnTag) {
        anchor.attrs.push({
          name: 'data-wafrn-tag',
          value: wafrnTag,
        })
        anchor.attrs.push({
          name: 'title',
          value: tag,
        })
      }
      anchor.childNodes = []
      defaultTreeAdapter.insertText(
        anchor,
        (isFriendica ? '' : '#') + (wafrnTag ? wafrnTag : tag),
      )
      return
    } else if (
      href != null &&
      (classList.includes('mention') ||
        // friendica wtaf
        (isFriendica =
          previousSibling &&
          defaultTreeAdapter.isTextNode(previousSibling) &&
          previousSibling.value.endsWith('@')))
    ) {
      const mention =
        mentionsByURL.get(href.value) ||
        mentionsByAcct.get(textContent(anchor).join('').replace(/^@/, ''))
      if (mention != null) {
        mention.included = true
        href.value = `/accounts/${mention.id}`
        c.value = 'mention'
        rel.value = 'nofollow noopener ugc'
        anchor.attrs.push({
          name: 'title',
          value: isFriendica ? mention.acct : `@${mention.acct}`,
        })
        anchor.childNodes = []
        defaultTreeAdapter.insertText(
          anchor,
          isFriendica ? mention.username : `@${mention.username}`,
        )
        return
      }
    }
    anchor.attrs.push(
      { name: 'title', value: href != null ? href.value : '' },
      { name: 'target', value: '_blank' },
    )
    rel.value = 'nofollow noopener ugc'
    c.value = ''
  }
  function walkElements(node: DefaultTreeAdapterMap['parentNode']): void {
    for (const child of node.childNodes) {
      if (defaultTreeAdapter.isElementNode(child)) {
        const c = child.attrs.find((attr) => attr.name === 'class')
        if (
          c &&
          /(?:\s|^)(?:quote-inline|reference-link-inline)(?:\s|$)/.test(
            c.value,
          ) &&
          hasQuote
        ) {
          defaultTreeAdapter.detachNode(child)
          continue
        }
        if (child.tagName === 'a') {
          handleAnchorNode(child)
        }
        walkElements(child)
      } else if (defaultTreeAdapter.isTextNode(child)) {
        handleTextNode(child)
      }
    }
  }
  walkElements(dom)
  return dom
}

export function renderPostHTML(
  opts: Parameters<typeof renderPostHTMLToDOM>[0],
): string {
  return serialize(renderPostHTMLToDOM(opts))
}
