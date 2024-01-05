import { DefaultTreeAdapterMap, parseFragment, defaultTreeAdapter } from 'parse5'
import { mark, stop } from './marks.js'

const blockElements = /^(p|d[dlti][vr]?|a(rticle|side|ddress)|fo(oter|rm)|header|hgroup|main|nav|se(arch|ction)|blockquote|fi(gcaption|gure|eldset)|center|h[r1-6]|menu|[uo]l|li(sting)?|legend|opt(group|ion)|pre|xmp|plaintext|frame|details|summary)$/

export function statusDomToPlainText (doc: DefaultTreeAdapterMap["parentNode"], mentions: any) {
  mark('statusDomToPlainText')
  function walkElements(node: DefaultTreeAdapterMap["parentNode"]) {
    let s = ""
    for(const child of node.childNodes) {
      if(defaultTreeAdapter.isElementNode(child)) {
        if(child.tagName==="br") {
          s+="\n"
        } else if(child.tagName === "a") {
          const c = child.attrs.find(attr => attr.name === "class")
          const h = child.attrs.find(attr => attr.name === "href")
          let m;
          if(mentions && c && c.value.split(/\s+/).includes("mention") && h && (m=mentions.find((mention: any) => h.value === mention.url || h.value === '/accounts/'+mention.id))) {
            s+='@'+m.acct
            continue
          }
        }
        s+=walkElements(child)
        if(child.tagName.match(blockElements)) s+="\n\n"
      } else if(defaultTreeAdapter.isTextNode(child)) {
        s+=child.value
      }
    }
    return s
  }
  const s = walkElements(doc)
  console.log(s)
  stop('statusDomToPlainText')
  return s
}

export function statusHtmlToPlainText (html: string, mentions: any) {
  if (!html) {
    return ''
  }
  return statusDomToPlainText(parseFragment(html), mentions)
}
