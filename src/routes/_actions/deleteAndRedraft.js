import { statusHtmlToPlainText } from '../_utils/statusHtmlToPlainText.ts'
import { importShowComposeDialog } from '../_components/dialog/asyncDialogs/importShowComposeDialog.js'
import { doDeleteStatus } from './delete.js'
import { store } from '../_store/store.js'
import { database } from '../_database/database.js'

export async function deleteAndRedraft (status) {
  const deleteStatusPromise = doDeleteStatus(status.id)
  const dialogPromise = importShowComposeDialog()
  const deletedStatus = await deleteStatusPromise
  let inReplyToHandle = null
  if (status.in_reply_to_id) {
    const { currentInstance } = store.get()
    const replyingTo = await database.getStatus(currentInstance, status.in_reply_to_id)
    if (replyingTo) inReplyToHandle = '@' + replyingTo.account.acct
  }
  store.clearComposeData('dialog')
  store.setComposeData('dialog', {
    text: (deletedStatus.akkoma && deletedStatus.akkoma.source && deletedStatus.akkoma.source.content) || deletedStatus.text || statusHtmlToPlainText(status.content, status.mentions),
    contentType: (deletedStatus.akkoma && deletedStatus.akkoma.source && deletedStatus.akkoma.source.mediaType) || deletedStatus.content_type || 'text/plain',
    contentWarningShown: !!status.spoiler_text,
    contentWarning: status.spoiler_text || '',
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
    quoteHandle: status.quote && '@' + status.quote.account.acct
  })
  const showComposeDialog = await dialogPromise
  showComposeDialog()
}
