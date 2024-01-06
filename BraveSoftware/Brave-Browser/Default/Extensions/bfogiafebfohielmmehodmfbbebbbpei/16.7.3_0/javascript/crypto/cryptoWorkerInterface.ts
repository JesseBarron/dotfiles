import _ from "lodash"
import { getExtensionBaseURL } from "../../shared/getExtensionBaseURL"

import type { CryptoPayload, CryptoResult, CryptoResultType } from "./processCryptoTasks"

export type CryptoWorkerMessage<T extends CryptoResultType> = {
  data: CryptoPayload[]
  resultType: T
  userKeys: ExportedUserCryptoKeys
}

export type ExportedUserCryptoKeys = {
  dataKey?: string
  rsaPrivateKey?: string
  eccPrivateKey?: string
  eccPublicKey?: string
}

export class CryptoWorker {
  private worker: Worker

  constructor() {
    const workerURL = getExtensionBaseURL() + '/javascript/cryptoWorker.js'
    this.worker = new Worker(workerURL)
  }

  decryptData<T extends CryptoResultType>(request: CryptoWorkerMessage<T>): Promise<CryptoResult<T>[]> {
    return new Promise((res, rej) => {
      this.worker.onmessage = function onWorkerMessage(e: MessageEvent<CryptoResult<T>[]>) {
        const results = e.data

        if (results.length === request.data.length) {
          res(results)
        } else {
          // If lengths don't match, something went wrong
          rej()
        }
      }

      this.worker.onerror = function onWorkerError(e) {
        console.log(`CryptoWorker error: ${e}`)
        rej('Worker error')
      }

      this.worker.postMessage(request)
    })
  }

  terminate() {
    this.worker.terminate()
  }

  static async performConcurrentRequests<T extends CryptoResultType>(workers: CryptoWorker[], data: CryptoPayload[], userKeys: ExportedUserCryptoKeys, resultType: T): Promise<CryptoResult<T>[]> {
    // Split into chunks for each worker
    const numberOfItems = data.length
    const chunkSize = Math.ceil(numberOfItems / workers.length)
    const chunks = _.chunk(data, chunkSize)

    // Issue concurrent requests
    const results = await Promise.all(
      chunks.map(async (chunk, index) => {
        const worker = workers[index]
        return worker.decryptData({
          data: chunk,
          userKeys,
          resultType,
        })
      })
    )

    // Flatten results
    const values = results.flatMap((results) => results)
    return values
  }
}