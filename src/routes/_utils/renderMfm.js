/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { parse } from 'mfm-js'

export function renderMfm ({
  mfmContent,
  originalStatus,
  autoplayGifs,
  emojis,
  mentionsByHandle,
  userHost
}) {
  const defaultHost = originalStatus.account.fqn.split('@')[1]
  const ast = parse(mfmContent)
  const validTime = (t) => {
    if (t == null) { return null }
    return t.match(/^[0-9.]+s$/) ? t : null
  }
  const useAnim = autoplayGifs
  const genEl = (ast, scale) => ast.map((token) => {
    switch (token.type) {
      case 'text': {
        const text = token.props.text.replace(/(\r\n|\n|\r)/g, '\n')
        const res = []
        for (const t of text.split('\n')) {
          res.push(document.createElement('br'))
          res.push(t)
        }
        res.shift()
        return res
      }
      case 'bold': {
        const ele = document.createElement('b')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      case 'strike': {
        const ele = document.createElement('del')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      case 'italic': {
        const ele = document.createElement('i')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      case 'fn': {
        // TODO: CSSを文字列で組み立てていくと token.props.args.~~~ 経由でCSSインジェクションできるのでよしなにやる
        let style
        switch (token.props.name) {
          case 'tada': {
            const speed = validTime(token.props.args.speed) ?? '1s'
            style = 'font-size: 150%;' + (useAnim ? `animation: tada ${speed} linear infinite both;` : '')
            break
          }
          case 'jelly': {
            const speed = validTime(token.props.args.speed) ?? '1s'
            style = (useAnim ? `animation: mfm-rubberBand ${speed} linear infinite both;` : '')
            break
          }
          case 'twitch': {
            const speed = validTime(token.props.args.speed) ?? '0.5s'
            style = useAnim ? `animation: mfm-twitch ${speed} ease infinite;` : ''
            break
          }
          case 'shake': {
            const speed = validTime(token.props.args.speed) ?? '0.5s'
            style = useAnim ? `animation: mfm-shake ${speed} ease infinite;` : ''
            break
          }
          case 'spin': {
            const direction = token.props.args.left
              ? 'reverse'
              : token.props.args.alternate
                ? 'alternate'
                : 'normal'
            const anime = token.props.args.x
              ? 'mfm-spinX'
              : token.props.args.y
                ? 'mfm-spinY'
                : 'mfm-spin'
            const speed = validTime(token.props.args.speed) ?? '1.5s'
            style = useAnim ? `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction};` : ''
            break
          }
          case 'jump': {
            const speed = validTime(token.props.args.speed) ?? '0.75s'
            style = useAnim ? `animation: mfm-jump ${speed} linear infinite;` : ''
            break
          }
          case 'bounce': {
            const speed = validTime(token.props.args.speed) ?? '0.75s'
            style = useAnim ? `animation: mfm-bounce ${speed} linear infinite; transform-origin: center bottom;` : ''
            break
          }
          case 'fade': {
            const direction = token.props.args.out
              ? 'alternate-reverse'
              : 'alternate'
            const speed = validTime(token.props.args.speed) || '1.5s'
            style = useAnim ? `animation: mfm-fade ${speed} linear infinite;animation-direction:${direction}` : ''
            break
          }
          case 'flip': {
            const transform = (token.props.args.h && token.props.args.v)
              ? 'scale(-1, -1)'
              : token.props.args.v
                ? 'scaleY(-1)'
                : 'scaleX(-1)'
            style = `transform: ${transform};`
            break
          }
          case 'x2': {
            const ele = document.createElement('span')
            ele.setAttribute('class', 'mfm-x2')
            ele.append(...genEl(token.children, scale * 2))
            return ele
          }
          case 'x3': {
            const ele = document.createElement('span')
            ele.setAttribute('class', 'mfm-x3')
            ele.append(...genEl(token.children, scale * 3))
            return ele
          }
          case 'x4': {
            const ele = document.createElement('span')
            ele.setAttribute('class', 'mfm-x4')
            ele.append(...genEl(token.children, scale * 4))
            return ele
          }
          case 'font': {
            const family = token.props.args.serif
              ? 'serif'
              : token.props.args.monospace
                ? 'monospace'
                : token.props.args.cursive
                  ? 'cursive'
                  : token.props.args.fantasy
                    ? 'fantasy'
                    : token.props.args.emoji
                      ? 'emoji'
                      : token.props.args.math
                        ? 'math'
                        : null
            if (family) { style = `font-family: ${family};` }
            break
          }
          case 'blur': {
            const ele = document.createElement('span')
            ele.setAttribute('class', '_mfm_blur_')
            ele.append(...genEl(token.children, scale))
            return ele
          }
          case 'rainbow': {
            if (!useAnim) {
              const ele = document.createElement('span')
              ele.setAttribute('class', '_mfm_rainbow_fallback_')
              ele.append(...genEl(token.children, scale))
              return ele
            }
            const speed = validTime(token.props.args.speed) ?? '1s'
            style = `animation: mfm-rainbow ${speed} linear infinite;`
            break
          }
          case 'sparkle': {
            const ele = document.createElement(useAnim ? 'easrng-sparkle' : 'span')
            ele.append(...genEl(token.children, scale))
            return ele
          }
          case 'rotate': {
            const degrees = parseFloat(token.props.args.deg ?? '90')
            style = `transform: rotate(${degrees}deg); transform-origin: center center;`
            break
          }
          case 'position': {
            const x = parseFloat(token.props.args.x ?? '0')
            const y = parseFloat(token.props.args.y ?? '0')
            style = `transform: translateX(${x}em) translateY(${y}em);`
            break
          }
          case 'scale': {
            const x = Math.min(parseFloat(token.props.args.x ?? '1'), 5)
            const y = Math.min(parseFloat(token.props.args.y ?? '1'), 5)
            style = `transform: scale(${x}, ${y});`
            scale = scale * Math.max(x, y)
            break
          }
          case 'fg': {
            let color = token.props.args.color
            if (!/^[0-9a-f]{3,6}$/i.test(color)) { color = 'f00' }
            style = `color: #${color};`
            break
          }
          case 'bg': {
            let color = token.props.args.color
            if (!/^[0-9a-f]{3,6}$/i.test(color)) { color = 'f00' }
            style = `background-color: #${color};`
            break
          }
        }
        if (style == null) {
          const ele = document.createElement('span')
          ele.append('$[', token.props.name, ' ', ...genEl(token.children, scale), ']')
          return ele
        } else {
          const ele = document.createElement('span')
          ele.setAttribute('style', 'display:inline-block;' + style)
          ele.append(...genEl(token.children, scale))
          return ele
        }
      }
      case 'small': {
        const ele = document.createElement('small')
        ele.setAttribute('style', 'opacity:0.7')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      case 'center': {
        const ele = document.createElement('div')
        ele.setAttribute('style', 'text-align:center')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      case 'url': {
        const ele = document.createElement('a')
        ele.setAttribute('title', token.props.url)
        ele.setAttribute('href', token.props.url)
        ele.setAttribute('target', '_blank')
        ele.setAttribute('rel', 'nofollow noopener')
        ele.textContent = token.props.url
        return ele
      }
      case 'link': {
        const ele = document.createElement('a')
        ele.setAttribute('title', token.props.url)
        ele.setAttribute('href', token.props.url)
        ele.setAttribute('target', '_blank')
        ele.setAttribute('rel', 'nofollow noopener')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      case 'mention': {
        const computedFqn = `${token.props.username}@${token.props.host || defaultHost || userHost}`
        const mention = mentionsByHandle.get(computedFqn)
        if (!mention) {
          let fallback = '@' + token.props.username
          if (token.props.host) {
            fallback += '@' + token.props.host
          }
          console.warn('failed to get mention for fqn', computedFqn)
          return Object.assign(document.createElement('a'), { className: 'mention', href: '/search?q=' + encodeURIComponent(fallback), title: fallback, textContent: '@' + token.props.username })
        }
        mention.included = true
        return Object.assign(document.createElement('a'), { className: 'mention', href: '/accounts/' + mention.id, title: '@' + mention.acct, textContent: '@' + mention.username })
      }
      case 'hashtag': {
        return Object.assign(document.createElement('a'), { className: 'hashtag', href: '/tags/' + encodeURIComponent(token.props.hashtag), textContent: '#' + token.props.hashtag })
      }
      case 'blockCode': {
        return Object.assign(document.createElement('pre'), { textContent: token.props.code })
      }
      case 'inlineCode': {
        return Object.assign(document.createElement('code'), { textContent: token.props.code })
      }
      case 'quote': {
        const ele = document.createElement('blockquote')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      case 'emojiCode': {
        const emoji = emojis.get(token.props.name)
        if (!emoji) return `:${token.props.name}:`
        const urlToUse = autoplayGifs ? emoji.url : emoji.static_url
        const shortcodeWithColons = `:${emoji.shortcode}:`
        const img = Object.assign(document.createElement('img'), {
          className: 'inline-custom-emoji',
          src: urlToUse,
          alt: shortcodeWithColons,
          title: shortcodeWithColons
        })
        img.setAttribute('draggable', 'false')
        return img
      }
      case 'unicodeEmoji': {
        return Object.assign(document.createElement('span'), {
          className: 'inline-emoji',
          textContent: token.props.emoji
        })
      }
      case 'mathInline': {
        return Object.assign(document.createElement('code'), { textContent: token.props.formula, className: 'to-katexify' })
      }
      case 'mathBlock': {
        return Object.assign(document.createElement('pre'), { textContent: token.props.formula, className: 'to-katexify' })
      }
      case 'search': {
        const form = document.createElement('form')
        form.setAttribute('target', '_blank')
        form.setAttribute('action', 'https://duckduckgo.com')
        form.setAttribute('class', '_mfm_search_')
        const button = document.createElement('button')
        button.setAttribute('class', 'search-button')
        button.setAttribute('aria-label', 'Search')
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('class', 'search-button-svg')
        svg.setAttribute('aria-hidden', 'true')
        svg.setAttribute('aria-label', '')
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
        use.setAttribute('xlink:href', '#fa-search')
        svg.appendChild(use)
        button.appendChild(svg)
        const input = document.createElement('input')
        input.setAttribute('type', 'text')
        input.setAttribute('readonly', '')
        input.setAttribute('name', 'q')
        input.setAttribute('value', token.props.query)
        form.append(input, button)
        return form
      }
      case 'plain': {
        const ele = document.createElement('span')
        ele.append(...genEl(token.children, scale))
        return ele
      }
      default: {
        console.error('unrecognized ast type:', token.type)
        return ''
      }
    }
  }).flat(Infinity)
  const ele = document.createElement('div')
  ele.append(...genEl(ast, 1))
  return ele
}
