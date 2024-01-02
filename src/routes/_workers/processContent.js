import registerPromiseWorker from 'promise-worker/register.js'
import { statusHtmlToPlainText } from '../_utils/statusHtmlToPlainText.js'
import { computeHashtagBarForStatus } from '../_utils/hashtagBar.js'
import { renderMfm } from '../_utils/renderMfm.js'
import { renderPostHTML } from '../_utils/renderPostHTML.js'
import { parseHTML } from 'linkedom/worker'
const { document } = parseHTML('')
self.document = document

registerPromiseWorker(async ({ originalStatus, autoplayGifs, currentVerifyCredentials }) => {
  const mfmContent = originalStatus.content_type === 'text/x.misskeymarkdown' ? originalStatus.text : (originalStatus.akkoma && originalStatus.akkoma.source && originalStatus.akkoma.source.mediaType === 'text/x.misskeymarkdown') ? originalStatus.akkoma.source.content : null
  let dom, hashtagsInBar
  const userHost = (currentVerifyCredentials && currentVerifyCredentials.fqn) ? currentVerifyCredentials.fqn.split('@')[1] : new URL(currentVerifyCredentials.url).hostname
  const emojis = new Map()
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
    dom = renderPostHTML({
      content: originalStatus.content,
      tags: originalStatus.tags,
      autoplayGifs,
      emojis,
      mentionsByURL,
      userHost
    })
  };
  ({ dom, hashtagsInBar } = computeHashtagBarForStatus(dom, originalStatus))
  if (originalStatus.mentions) {
    const extraMentions = originalStatus.mentions.filter(mention => !mention.included)
    if (extraMentions.length) {
      let firstBlock = dom
      while (firstBlock.firstChild && firstBlock.firstChild && firstBlock.firstChild.nodeType === 1 && ['DIV', 'P'].includes(firstBlock.firstChild.tagName)) {
        firstBlock = firstBlock.firstChild
      }
      while (extraMentions.length) {
        const mention = extraMentions.pop()
        if (mention.id === originalStatus.account.id) {
          continue
        }
        firstBlock.prepend(Object.assign(document.createElement('a'), {
          className: 'mention',
          href: `/accounts/${mention.id}`,
          title: `@${mention.acct}`,
          textContent: `@${mention.username}`
        }), ' ')
      }
    }
  }
  return { content: dom.innerHTML, hashtagsInBar, plainTextContent: statusHtmlToPlainText(originalStatus.content, originalStatus.mentions) }
})
