import { escapeRegExp } from './escapeRegExp.js'
import { getEmojiRegex } from './emojiRegex.js'
import { DefaultTreeAdapterMap, defaultTreeAdapter, html, parseFragment, serialize } from 'parse5'
const { NS: { HTML, SVG } } = html

declare const document: never

function consumeBalanced(string: string, open: string, close: string) {
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
    remaining: string.slice(index + 2)
  }
}

export function renderPostHTMLToDOM({
  content,
  tags,
  autoplayGifs,
  emojis,
  mentionsByURL
}: {
  content: string,
  tags: any[],
  autoplayGifs: boolean,
  emojis: Map<string, any>,
  mentionsByURL: Map<string, any>,
}) {
  if (!content) {
    return defaultTreeAdapter.createElement('div', HTML, [])
  }
  const dom = parseFragment(content)
  const customEmoji = [...emojis.keys()].map(e => escapeRegExp(e)).join('|')
  const unicodeEmoji = getEmojiRegex().source
  const part = new RegExp(`:(${customEmoji}):|(${unicodeEmoji})|(.)`, 'g')
  function handleTextNode(node: DefaultTreeAdapterMap['textNode']) {
    let newNodes = []
    for (const [_, customEmoji, unicodeEmoji, text] of node.value.matchAll(part)) {
      if (text) {
        if (typeof newNodes[newNodes.length - 1] === 'string') {
          newNodes[newNodes.length - 1] += text
        } else {
          newNodes.push(text)
        }
      } else if (customEmoji) {
        const emoji = emojis.get(customEmoji)
        if (!emoji) newNodes.push(`:${customEmoji}:`)
        const urlToUse = autoplayGifs ? emoji.url : emoji.static_url
        const shortcodeWithColons = `:${emoji.shortcode}:`
        const ele = defaultTreeAdapter.createElement('img', HTML, [
          { name: 'class', value: 'inline-custom-emoji' },
          { name: 'draggable', value: 'false' },
          { name: 'src', value: urlToUse },
          { name: 'alt', value: shortcodeWithColons },
          { name: 'title', value: shortcodeWithColons }
        ])
        newNodes.push(ele)
      } else if (unicodeEmoji) {
        const ele = defaultTreeAdapter.createElement('span', HTML, [{ name: 'class', value: 'inline-emoji' }])
        defaultTreeAdapter.insertText(ele, unicodeEmoji)
        newNodes.push(ele)
      }
    }
    const frag = defaultTreeAdapter.createDocumentFragment()
    for (let text of newNodes) {
      if (typeof text === 'string') {
        let match
        while ((match = text.match(/((?<!\$)\$\$(?!\$))|(\\\()|(\\\[)/))) {
          const prev = text.slice(0, match.index)
          if (prev !== '') {
            defaultTreeAdapter.insertText(frag, prev)
          }
          text = text.slice((match.index || 0) + match[0].length)
          if (match[1]) {
            const consumed = text.slice(0, text.indexOf('$$'))
            const codeElement = defaultTreeAdapter.createElement('code', HTML, [{ name: 'class', value: 'to-katexify' }])
            defaultTreeAdapter.insertText(codeElement, consumed)
            defaultTreeAdapter.appendChild(frag, codeElement)
            text = text.slice(consumed.length + 2)
          } else if (match[2]) {
            const { consumed, remaining } = consumeBalanced(text, '(', ')')
            const codeElement = defaultTreeAdapter.createElement('code', HTML, [{ name: 'class', value: 'to-katexify' }])
            defaultTreeAdapter.insertText(codeElement, consumed)
            defaultTreeAdapter.appendChild(frag, codeElement)
            text = remaining
          } else if (match[3]) {
            const { consumed, remaining } = consumeBalanced(text, '[', ']')
            const codeElement = defaultTreeAdapter.createElement('pre', HTML, [{ name: 'class', value: 'to-katexify' }])
            defaultTreeAdapter.insertText(codeElement, consumed)
            defaultTreeAdapter.appendChild(frag, codeElement)
            text = remaining
          }
        }
        if (text !== '') {
          defaultTreeAdapter.insertText(frag, text)
        }
      } else { defaultTreeAdapter.appendChild(frag, text) }
    }
    for (const child of frag.childNodes) {
      defaultTreeAdapter.insertBefore(node.parentNode!, child, node)
    }
    defaultTreeAdapter.detachNode(node)
  }
  function handleAnchorNode(anchor: DefaultTreeAdapterMap['element']) {
    let c = anchor.attrs.find(attr => attr.name === "class") || {name: 'href', value: ''}
    const href = anchor.attrs.find(attr => attr.name === 'href') || {name: 'href', value: ''}
    const classList = c.value ? c.value.split(/\s+/g) : null
    anchor.attrs = [c, href]
    if (tags && href && classList && classList.includes('hashtag')) {
      for (const tag of tags) {
        if (href.value.toLowerCase().endsWith(`/${tag.name.toLowerCase()}`)) {
          href.value = `/tags/${tag.name}`
          c.value = 'hashtag'
          return
        }
      }
    } else if (href && classList?.includes('mention')) {
      const mention = mentionsByURL.get(href.value)
      if (mention) {
        mention.included = true
        href.value = `/accounts/${mention.id}`
        c.value = 'mention'
        anchor.attrs.push({ name: "title", value: `@${mention.acct}` })
        anchor.childNodes = []
        defaultTreeAdapter.insertText(anchor, `@${mention.username}`)
        return
      }
    }
    anchor.attrs.push({ name: "title", value: href ? href.value : "" }, { name: "target", value: "_blank" }, { name: "rel", value: "nofollow noopener" })
    c.value = ""
  }
  function walkElements(node: DefaultTreeAdapterMap["parentNode"]) {
    let s = ""
    for (const child of node.childNodes) {
      if (defaultTreeAdapter.isElementNode(child)) {
        if (child.tagName === "a") {
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

export function renderPostHTML(opts: Parameters<typeof renderPostHTMLToDOM>[0]) {
  return serialize(renderPostHTMLToDOM(opts))
}