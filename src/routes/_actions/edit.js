import { statusHtmlToPlainText } from '../_utils/statusHtmlToPlainText.ts'
import { importShowComposeDialog } from '../_components/dialog/asyncDialogs/importShowComposeDialog.js'
import { store } from '../_store/store.js'
import { database } from '../_database/database.js'
import { getStatusSource } from '../_api/statuses.js'

export async function edit (status) {
  const { currentInstance, accessToken } = store.get()
  const sourcePromise = await getStatusSource(currentInstance, accessToken, status.id)
  const dialogPromise = importShowComposeDialog()
  const source = await sourcePromise
  let inReplyToHandle = null
  if (status.in_reply_to_id) {
    const replyingTo = await database.getStatus(currentInstance, status.in_reply_to_id)
    if (replyingTo) inReplyToHandle = '@' + replyingTo.account.acct
  }
  store.clearComposeData('dialog')

  const pleromaAkkomaSpecificAPI = source.pleroma || source.akkoma
  store.setComposeData('dialog', {
    text: (pleromaAkkomaSpecificAPI && pleromaAkkomaSpecific.source && pleromaAkkomaSpecific.source.content) || source.text || statusHtmlToPlainText(status.content, status.mentions),
    contentType: (pleromaAkkomaSpecificAPI && pleromaAkkomaSpecific.source && pleromaAkkomaSpecific.source.mediaType) || source.content_type || 'text/plain',
    contentWarningShown: !!(source.spoiler_text || status.spoiler_text),
    contentWarning: source.spoiler_text || status.spoiler_text || '',
    postPrivacy: status.visibility,
    media: status.media_attachments && status.media_attachments.map(_ => ({
      description: _.description || '',
      data: _
    })),
    inReplyToId: status.in_reply_to_id,
    inReplyToHandle,
    // note that for polls there is no real way to preserve the original expiry
    poll: status.poll && {
      multiple: !!status.poll.multiple,
      options: (status.poll.options || []).map(option => option.title)
    },
    sensitive: !!status.sensitive,
    quoteId: status.quote_id,
    localOnly: status.local_only,
    quoteHandle: status.quote && '@' + status.quote.account.acct,
    editId: status.id
  })
  const showComposeDialog = await dialogPromise
  showComposeDialog()
}
