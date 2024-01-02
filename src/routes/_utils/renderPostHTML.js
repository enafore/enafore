import { grabAllTextNodes } from './grabAllTextNodes.js'
import { escapeRegExp } from './escapeRegExp.js'
import { getEmojiRegex } from './emojiRegex.js'

function consumeBalanced (string, open, close) {
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

export function renderPostHTML ({
  content,
  tags,
  autoplayGifs,
  emojis,
  mentionsByURL
}) {
  const dom = document.createElement('div')
  if (!content) {
    return dom
  }
  dom.innerHTML = content
  const textNodes = grabAllTextNodes(dom, [])
  const customEmoji = [...emojis.keys()].map(e => escapeRegExp(e)).join('|')
  const unicodeEmoji = getEmojiRegex().source
  const part = new RegExp(`:(${customEmoji}):|(${unicodeEmoji})|(.)`, 'g')
  for (const node of textNodes) {
    let newNodes = []
    // eslint-disable-next-line no-unused-vars
    for (const [_, customEmoji, unicodeEmoji, text] of node.nodeValue.matchAll(part)) {
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
        const ele = document.createElement('img')
        ele.setAttribute('class', 'inline-custom-emoji')
        ele.setAttribute('draggable', 'false')
        ele.setAttribute('src', urlToUse)
        ele.setAttribute('alt', shortcodeWithColons)
        ele.setAttribute('title', shortcodeWithColons)
        newNodes.push(ele)
      } else if (unicodeEmoji) {
        const ele = document.createElement('span')
        ele.setAttribute('class', 'inline-emoji')
        ele.textContent = unicodeEmoji
        newNodes.push(ele)
      }
    }
    newNodes = newNodes.map(text => {
      if (typeof text !== 'string') return text
      const fragment = document.createDocumentFragment()
      let match
      while ((match = text.match(/((?<!\$)\$\$(?!\$))|(\\\()|(\\\[)/))) {
        const prev = text.slice(0, match.index)
        if (prev !== '') fragment.append(prev)
        text = text.slice(match.index + match[0].length)
        if (match[1]) {
          const consumed = text.slice(0, text.indexOf('$$'))
          const codeElement = document.createElement('code')
          codeElement.textContent = consumed
          codeElement.setAttribute('class', 'to-katexify')
          fragment.appendChild(codeElement)
          text = text.slice(consumed.length + 2)
        } else if (match[2]) {
          const { consumed, remaining } = consumeBalanced(text, '(', ')')
          const codeElement = document.createElement('code')
          codeElement.textContent = consumed
          codeElement.setAttribute('class', 'to-katexify')
          fragment.appendChild(codeElement)
          text = remaining
        } else if (match[3]) {
          const { consumed, remaining } = consumeBalanced(text, '[', ']')
          const codeElement = document.createElement('pre')
          codeElement.textContent = consumed
          codeElement.setAttribute('class', 'to-katexify')
          fragment.appendChild(codeElement)
          text = remaining
        }
      }
      if (text !== '') fragment.append(text)
      return fragment
    })
    node.replaceWith(...newNodes)
  }
  const anchors = Array.from(dom.getElementsByTagName('A'))
  for (const anchor of anchors) {
    block: { // eslint-disable-line no-labels
      if (tags && anchor.classList.contains('hashtag')) {
        for (const tag of tags) {
          if (anchor.getAttribute('href').toLowerCase().endsWith(`/${tag.name.toLowerCase()}`)) {
            anchor.setAttribute('href', `/tags/${tag.name}`)
            anchor.removeAttribute('target')
            anchor.removeAttribute('rel')
            anchor.setAttribute('class', 'hashtag')
            break block // eslint-disable-line no-labels
          }
        }
      } else if (anchor.classList.contains('mention')) {
        const mention = mentionsByURL.get(anchor.getAttribute('href'))
        if (mention) {
          mention.included = true
          anchor.setAttribute('href', `/accounts/${mention.id}`)
          anchor.setAttribute('title', `@${mention.acct}`)
          anchor.removeAttribute('target')
          anchor.removeAttribute('rel')
          anchor.setAttribute('class', 'mention')
          anchor.textContent = `@${mention.username}`
          break block // eslint-disable-line no-labels
        }
      }
      anchor.setAttribute('title', anchor.href)
      anchor.setAttribute('target', '_blank')
      anchor.setAttribute('rel', 'nofollow noopener')
      anchor.removeAttribute('class')
    }
  }
  return dom
}
