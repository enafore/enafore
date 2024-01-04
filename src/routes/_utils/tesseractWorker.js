import workerPath from 'tesseract.js/dist/worker.min.js'
import { createWorker } from 'tesseract.js'

export default async (logger) => await createWorker('eng', 1, {
  workerPath,
  cacheMethod: 'none', // this file is 23.4MB ungzipped, so store in service worker instead (11MB gzipped)
  workerBlobURL: false,
  logger
})
