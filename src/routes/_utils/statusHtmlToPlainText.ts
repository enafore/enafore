import { DefaultTreeAdapterMap, parseFragment, defaultTreeAdapter } from 'parse5'
import { mark, stop } from './marks.js'

const blockElements = /^(p$|d[dlti]|a[rsd]|fo[or]|mai|na|se[ac]|bl|fi|ce|h|men|[uo]l|li|le|op|pre|x|pl|fr|det|sum)/

export function statusDomToPlainText(doc: DefaultTreeAdapterMap["parentNode"], mentions: any) {
  mark('statusDomToPlainText')
  function walkElements(node: DefaultTreeAdapterMap["parentNode"]) {
    let s = ""
    for (const child of node.childNodes) {
      if (defaultTreeAdapter.isElementNode(child)) {
        if (child.tagName === "br") {
          s += "\n"
        } else if (child.tagName === "a") {
          const c = child.attrs.find(attr => attr.name === "class")
          const h = child.attrs.find(attr => attr.name === "href")
          let m;
          if (mentions && c && c.value.split(/\s+/).includes("mention") && h && (m = mentions.find((mention: any) => h.value === mention.url || h.value === '/accounts/' + mention.id))) {
            s += '@' + m.acct
            continue
          }
        } else if (child.tagName === "img") {
          const alt = child.attrs.find(attr => attr.name === "alt")
          if (alt) s += alt.value
        }
        s += walkElements(child)
        if (child.tagName.match(blockElements)) s += "\n\n"
      } else if (defaultTreeAdapter.isTextNode(child)) {
        s += child.value
      }
    }
    return s
  }
  const s = walkElements(doc)
  stop('statusDomToPlainText')
  return s
}

export function statusHtmlToPlainText(html: string, mentions: any) {
  if (!html) {
    return ''
  }
  return statusDomToPlainText(parseFragment(html), mentions)
}
