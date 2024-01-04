import registerPromiseWorker from 'promise-worker/register.js'
//import { statusHtmlToPlainText } from '../../_utils/statusHtmlToPlainText.js'
// @ts-ignore
import { computeHashtagBarForStatus } from './hashtagBar.ts'
// @ts-ignore
import { renderMfm } from './mfm.ts'
//import { renderPostHTML } from '../../_utils/renderPostHTML.js'
import { type DefaultTreeAdapterMap, defaultTreeAdapter, html, serialize, parseFragment } from 'parse5'
const { NS: { HTML } } = html

registerPromiseWorker(async ({ originalStatus, autoplayGifs, currentVerifyCredentials }) => {
  const mfmContent = originalStatus.content_type === 'text/x.misskeymarkdown' ? originalStatus.text : (originalStatus.akkoma && originalStatus.akkoma.source && originalStatus.akkoma.source.mediaType === 'text/x.misskeymarkdown') ? originalStatus.akkoma.source.content : null
  let dom: DefaultTreeAdapterMap["parentNode"], hashtagsInBar: string[]
  const userHost = (currentVerifyCredentials && currentVerifyCredentials.fqn) ? currentVerifyCredentials.fqn.split('@')[1] : new URL(currentVerifyCredentials.url).hostname
  const emojis = new Map<string, any>()
  if (originalStatus.emojis) {
    for (const emoji of originalStatus.emojis) {
      emojis.set(emoji.shortcode, emoji)
    }
  }
  const mentionsByHandle = new Map()
  const mentionsByURL = new Map()
  if (originalStatus.mentions) {
    for (const mention of originalStatus.mentions) {
      mention.included = false
      mentionsByURL.set(mention.url, mention)
      mentionsByHandle.set(mention.acct.includes('@') ? mention.acct : `${mention.acct}@${userHost}`, mention)
      const domainParts = new URL(mention.url).hostname.split('.')
      do {
        mentionsByHandle.set(`${mention.acct.split('@')[0]}@${domainParts.join('.')}`, mention)
      } while (domainParts.shift())
    }
  }
  if (mfmContent) {
    dom = renderMfm({
      mfmContent,
      originalStatus,
      autoplayGifs,
      emojis,
      mentionsByHandle,
      userHost
    })
  } else {
    dom = parseFragment(originalStatus.content)
    /*dom = renderPostHTML({
      content: originalStatus.content,
      tags: originalStatus.tags,
      autoplayGifs,
      emojis,
      mentionsByURL
    })*/
  };
  ({ dom, hashtagsInBar } = computeHashtagBarForStatus(dom, originalStatus))
  if (originalStatus.mentions) {
    const extraMentions = originalStatus.mentions.filter((mention: any) => !mention.included)
    if (extraMentions.length) {
      let firstBlock = dom
      while (firstBlock.childNodes.length && 'tagName' in firstBlock.childNodes[0] && ['div', 'p'].includes(firstBlock.childNodes[0].tagName)) {
        firstBlock = firstBlock.childNodes[0]
      }
      while (extraMentions.length) {
        const mention = extraMentions.pop()
        if (mention.id === originalStatus.account.id) {
          continue
        }
        const ele = defaultTreeAdapter.createElement('a', HTML, [
          {
            name: 'class',
            value: 'mention'
          },
          {
            name: 'href',
            value: '/accounts/' + mention.id
          },
          {
            name: 'title',
            value: '@' + mention.acct
          }
        ])
        defaultTreeAdapter.insertText(ele, '@' + mention.username)
        defaultTreeAdapter.insertTextBefore(firstBlock, ' ', firstBlock.childNodes[0])
        defaultTreeAdapter.insertBefore(firstBlock, ele, firstBlock.childNodes[0])
      }
    }
  }
  return { content: serialize(dom), hashtagsInBar, /* plainTextContent: statusHtmlToPlainText(originalStatus.content, originalStatus.mentions)*/ }
})
