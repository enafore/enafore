import './routes/_utils/console/hook.ts'
import * as sapper from '../__sapper__/client.js'
import './routes/_utils/serviceWorkerClient.js'
import './routes/_utils/historyEvents.js'
import './routes/_utils/loadingMask.js'
import './routes/_utils/forceOnline.js'
import { mark, stop } from './routes/_utils/marks.js'
import { loadPolyfills } from './routes/_utils/polyfills/loadPolyfills.js'
import { loadNonCriticalPolyfills } from './routes/_utils/polyfills/loadNonCriticalPolyfills.js'
import { queueMicrotask } from './routes/_utils/queueMicrotask.js'
import idbReady from 'safari-14-idb-fix'
import { inject } from '@vercel/analytics'

const realFocus = HTMLElement.prototype.focus
HTMLElement.prototype.focus = function (options = {}) {
  const fn = () => realFocus.call(this, options)
  options.now ? fn() : queueMicrotask(fn)
}

Promise.all([idbReady(), loadPolyfills()]).then(() => {
  mark('sapperStart')
  sapper.start({ target: document.querySelector('#sapper') })
  stop('sapperStart')
  /* no await */ loadNonCriticalPolyfills()
})

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
}
