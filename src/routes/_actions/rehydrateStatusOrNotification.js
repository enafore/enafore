import { get } from '../_utils/lodash-lite.js'
import { mark, stop } from '../_utils/marks.js'
import {
  decode as decodeBlurhash,
  init as initBlurhash
} from '../_utils/blurhash.js'
import { store } from '../_store/store.js'
import PromiseWorker from 'promise-worker'
import { emit } from '../_utils/eventBus.js'

let worker
export function init () {
  worker = worker || new PromiseWorker(new Worker(new URL('../_workers/processContent/index.ts', import.meta.url)))
  if (process.browser) {
    try {
      initBlurhash()
    } catch (err) {
      console.error('could not start blurhash worker', err)
    }
  }
}

function getActualStatus (statusOrNotification) {
  return (
    get(statusOrNotification, ['status']) ||
    get(statusOrNotification, ['notification', 'status'])
  )
}

async function decodeAllBlurhashes (status) {
  const mediaWithBlurhashes = get(status, ['media_attachments'], [])
    .filter(_ => _.blurhash)
  if (mediaWithBlurhashes.length) {
    mark(`decodeBlurhash-${status.id}`)
    await Promise.all(
      mediaWithBlurhashes.map(async media => {
        try {
          media.decodedBlurhash = await decodeBlurhash(media.blurhash)
        } catch (err) {
          console.warn('Could not decode blurhash, ignoring', err)
        }
      })
    )
    if (status[rehydrated]) {
      emit('statusUpdated', status)
    }
    stop(`decodeBlurhash-${status.id}`)
  }
}

export const rehydrated = Symbol('rehydrated')
export const rehydrating = Symbol('rehydrating')

function rehydrateQuote (originalStatus) {
  if (originalStatus.quote) {
    return rehydrateStatusOrNotification({ status: originalStatus.quote })
  }
}

async function processStatusContent (originalStatus) {
  try {
    const { autoplayGifs, currentVerifyCredentials } = store.get()
    Object.assign(originalStatus, await worker.postMessage({ originalStatus, autoplayGifs, currentVerifyCredentials }))
  } catch (e) {
    console.warn('failed to processStatusContent', originalStatus, e)
  }
}

// Do stuff that we need to do when the status or notification is fetched from the database,
// like calculating the blurhash or calculating the plain text content
export async function rehydrateStatusOrNotification (statusOrNotification) {
  init()
  const status = getActualStatus(statusOrNotification)
  if (!status) return
  const originalStatus = status.reblog ? status.reblog : status
  if (originalStatus[rehydrated] || originalStatus[rehydrating]) return
  originalStatus[rehydrating] = true
  /* no await */ decodeAllBlurhashes(originalStatus)
  await Promise.all([
    processStatusContent(originalStatus),
    rehydrateQuote(originalStatus)
  ])
  delete originalStatus[rehydrating]
  originalStatus[rehydrated] = new Error('rehydrated at')
}
