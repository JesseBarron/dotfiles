import RSAKey from '../jsbn/rsa'
import processCryptoTasks, { CryptoResultType } from './processCryptoTasks'

import type { CryptoWorkerMessage } from './cryptoWorkerInterface'
import type { CryptoPayload, UserCryptoKeys } from './processCryptoTasks'

self.addEventListener('message', async function <T extends CryptoResultType>(e: MessageEvent<CryptoWorkerMessage<T>>) {
  const payloads: CryptoPayload[] = e.data.data
  const resultType = e.data.resultType
  const userKeysAsStrings = e.data.userKeys

  const userKeys: UserCryptoKeys = {
    dataKey: deserializeUint8Array(userKeysAsStrings.dataKey || ''),
    eccPrivateKey: deserializeUint8Array(userKeysAsStrings.eccPrivateKey || ''),
    eccPublicKey: deserializeUint8Array(userKeysAsStrings.eccPublicKey || ''),
    rsaPrivateKey: new RSAKey(),
  }
  userKeys.rsaPrivateKey!.readPrivateKeyFromASN1HexString(userKeysAsStrings.rsaPrivateKey || '')

  // Run decryption job
  const results = await processCryptoTasks(payloads, resultType, userKeys)

  // @ts-ignore since we're not typed for Worker window context
  self.postMessage(results)
})

function deserializeUint8Array(jsonString: string): Uint8Array {
  return Uint8Array.from(Object.values(JSON.parse(jsonString)))
}