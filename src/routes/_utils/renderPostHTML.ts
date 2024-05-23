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
import * as hashtag from '../_workers/processContent/hashtagBar.ts'

const {
  NS: { HTML },
} = html

function consumeBalanced(
  string: string,
  open: string,
  close: string,
): {
  consumed: string
  remaining: string
} {
  let balance = 1
  let index = 0
  while (index < string.length) {
    if (string[index] === '\\' && string[index + 1] === open) {
      balance++
      index += 2
    } else if (string[index] === '\\' && string[index + 1] === close) {
      balance--
      if (balance === 0) {
        break
      }
      index += 2
    } else {
      index++
    }
  }
  return {
    consumed: string.slice(0, index),
    remaining: string.slice(index + 2),
  }
}

export function renderPostHTMLToDOM({
  content,
  tags,
  autoplayGifs,
  emojis,
  mentionsByURL,
}: {
  content: string
  tags: Array<{ name: string }>
  autoplayGifs: boolean
  emojis: Map<string, { url: string; static_url?: string; shortcode: string }>
  mentionsByURL: Map<string, Mention>
}): DefaultTreeAdapterMap['parentNode'] {
  if (!content) {
    return defaultTreeAdapter.createDocumentFragment()
  }
  const normalizedTagNames: string[] = tags.map((tag: any) =>
    tag.name.normalize('NFKC'),
  )
  const dom = parseFragment(content)
  const customEmoji = [...emojis.keys()].map((e) => escapeRegExp(e)).join('|')
  const unicodeEmoji = getEmojiRegex().source
  const part = new RegExp(`:(${customEmoji}):|(${unicodeEmoji})|(.)`, 'g')
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
          let urlToUse = emoji.url
          if (autoplayGifs) {
            urlToUse = emoji.static_url ?? emoji.url
          }
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
        let match
        while (
          (match = text.match(/((?<!\$)\$\$(?!\$))|(\\\()|(\\\[)/)) != null
        ) {
          const prev = text.slice(0, match.index)
          if (prev !== '') {
            defaultTreeAdapter.insertText(frag, prev)
          }
          text = text.slice((match.index ?? 0) + match[0].length)
          if (match[1] !== '') {
            const consumed = text.slice(0, text.indexOf('$$'))
            const codeElement = defaultTreeAdapter.createElement('code', HTML, [
              { name: 'class', value: 'to-katexify' },
            ])
            defaultTreeAdapter.insertText(codeElement, consumed)
            defaultTreeAdapter.appendChild(frag, codeElement)
            text = text.slice(consumed.length + 2)
          } else if (match[2] !== '') {
            const { consumed, remaining } = consumeBalanced(text, '(', ')')
            const codeElement = defaultTreeAdapter.createElement('code', HTML, [
              { name: 'class', value: 'to-katexify' },
            ])
            defaultTreeAdapter.insertText(codeElement, consumed)
            defaultTreeAdapter.appendChild(frag, codeElement)
            text = remaining
          } else if (match[3] !== '') {
            const { consumed, remaining } = consumeBalanced(text, '[', ']')
            const codeElement = defaultTreeAdapter.createElement('pre', HTML, [
              { name: 'class', value: 'to-katexify' },
            ])
            defaultTreeAdapter.insertText(codeElement, consumed)
            defaultTreeAdapter.appendChild(frag, codeElement)
            text = remaining
          }
        }
        if (text) {
          defaultTreeAdapter.insertText(frag, text)
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
    let tag: string | boolean
    if (
      href != null &&
      (tag = hashtag.isValidHashtagNode(anchor, normalizedTagNames)) &&
      typeof tag === 'string'
    ) {
      let isFriendica = href.value.includes('/search?tag=')
      if (isFriendica) {
        isFriendica = false
        const parent = anchor.parentNode
        if (parent) {
          const index = parent.childNodes.indexOf(anchor)
          const previousSibling = parent.childNodes[index - 1]
          if (
            previousSibling &&
            defaultTreeAdapter.isTextNode(previousSibling) &&
            previousSibling.value.endsWith('#')
          ) {
            isFriendica = true
          }
        }
      }
      href.value = `/tags/${encodeURIComponent(tag)}`
      c.value = 'hashtag'
      rel.value = 'nofollow noopener ugc tag'
      anchor.childNodes = []
      defaultTreeAdapter.insertText(anchor, (isFriendica ? '' : '#') + tag)
      return
    } else if (href != null && classList.includes('mention')) {
      const mention = mentionsByURL.get(href.value)
      if (mention != null) {
        mention.included = true
        href.value = `/accounts/${mention.id}`
        c.value = 'mention'
        rel.value = 'nofollow noopener ugc'
        anchor.attrs.push({ name: 'title', value: `@${mention.acct}` })
        anchor.childNodes = []
        defaultTreeAdapter.insertText(anchor, `@${mention.username}`)
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
