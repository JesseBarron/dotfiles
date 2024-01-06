
import { base64_to_bytes, bytes_to_base64 } from "asmcrypto.js/dist_es8/other/exportedUtils"
import RSAKey from "../jsbn/rsa"

export type CryptoResultType = 'base64' | 'jsonObject' | 'utf8'

export type CryptoPayload = {
  id: string
  cryptoKey?: string
  cipherText: string
  cipher?: 'AES-CBC' | 'AES-GCM' | 'ECC' | 'RSA'
}

export type CryptoResult<T> = (
  T extends 'base64' ? string : 
  T extends 'jsonObject' ? Object : 
  T extends 'utf8' ? string : 
  never
) | null

export type UserCryptoKeys = {
  dataKey: Uint8Array
  rsaPrivateKey: RSAKey
  eccPrivateKey: Uint8Array
  eccPublicKey: Uint8Array
}

export default async function processCryptoTasks<T extends CryptoResultType>(tasks: CryptoPayload[], resultType: T, userKeys: UserCryptoKeys): Promise<CryptoResult<T>[]> {
  const results = await Promise.allSettled(
    tasks.map((v) => decryptPayload(userKeys, v, resultType))
  )

  return results.map<CryptoResult<T>>((item) => {
    if (item.status === 'fulfilled') {
      return item.value as CryptoResult<T>
    } else {
      return null
    }
  })
}

async function decryptPayload<T extends CryptoResultType>(
  userKeys: UserCryptoKeys,
  payload: CryptoPayload,
  resultType: CryptoResultType,
): Promise<CryptoResult<T>> {
  if (!payload.cipherText?.length) {
    return null
  }

  const dataBytes = base64urlsafe_to_bytes(payload.cipherText)

  let bytes: Uint8Array | null
  try {
    switch (payload.cipher) {
      case 'AES-CBC': {
        let keyBytes: Uint8Array
        if (payload.cryptoKey) {
          keyBytes = base64urlsafe_to_bytes(payload.cryptoKey)
        } else {
          const {dataKey} = userKeys 
          if (!dataKey) {
            return null
          } else {
            keyBytes = dataKey
          }
        }
        /*
        Consider having an option to include a noPadding option to process
        cryptoTasks AES CBC with no padding. Is not useful at the moment
        since the only thing that requires no padding is the datakey
        */
        bytes = await aesCbcDecrypt(dataBytes, keyBytes)
        break
      }

      case 'AES-GCM': {
        let keyBytes: Uint8Array
        if (payload.cryptoKey) {
          keyBytes = base64urlsafe_to_bytes(payload.cryptoKey)
        } else {
          const {dataKey} = userKeys 
          if (!dataKey) {
            return null
          } else {
            keyBytes = dataKey
          }
        }
        bytes = await aesGcmDecrypt(dataBytes, keyBytes)
        break
      }

      case 'ECC': {
        const {eccPrivateKey, eccPublicKey} = userKeys
        if (eccPrivateKey?.length && eccPublicKey?.length) {
          bytes = await privateDecryptEC(dataBytes, eccPrivateKey, eccPublicKey)
          break
        } else {
          return null
        }
      }

      case 'RSA':
        let rsaKey: RSAKey
        if (payload.cryptoKey) {
          // Use provided key
          rsaKey = new RSAKey()
          rsaKey.readPrivateKeyFromASN1HexString(payload.cryptoKey)
        } else {
          // Use user RSA key
          const {rsaPrivateKey} = userKeys
          if (rsaPrivateKey) {
            rsaKey = rsaPrivateKey
          } else {
            return null
          }
        } 

        // convert the encrypted record key from base64 to hex, since JSBN
        // works on hex.
        const encrypted_key_hex = base64WebSafeToHex(payload.cipherText)
        const decrypted_key_hex = rsaKey.decryptBinary(encrypted_key_hex)

        if (!decrypted_key_hex) {
          throw new Error('decrypt_type2_key_error1 RSA Key decryption failed.')
        }

        bytes = hexToBytes(decrypted_key_hex)
        if (bytes.length !== 32) {
          throw new Error('decrypt_type2_key_error2 RSA Key decryption failed.')
        }
        break

      default:
        return null
    }

    switch (resultType) {
      case 'base64':
        return bytes_to_base64urlsafe(bytes) as CryptoResult<T>
      case 'jsonObject':
        return JSON.parse(bytesToString(bytes)) as CryptoResult<T>
      case 'utf8':
        return bytesToString(bytes) as CryptoResult<T>
    }
  } catch (e: any) {
    console.log(e)
    return null
  }
}

/**
 * Helpers below borrowed from keeper-sdk-javascript, browser/platform.ts. 
 * Copy-pasted instead of imported to keep our worker bundles light as possible.
 */

async function aesGcmDecrypt(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
  let _key = await crypto.subtle.importKey('raw', key, 'AES-GCM', true, ['decrypt'])
  let iv = data.subarray(0, 12)
  let encrypted = data.subarray(12)
  let res = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    _key,
    encrypted
  )
  return new Uint8Array(res)
}

async function aesCbcDecrypt(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
  let _key = await crypto.subtle.importKey('raw', key, 'AES-CBC', true, ['decrypt'])
  let iv = data.subarray(0, 16)
  let encrypted = data.subarray(16)
  let res = await crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: iv,
    },
    _key,
    encrypted
  )
  return new Uint8Array(res)
}

async function privateDecryptEC(
  data: Uint8Array,
  privateKey: Uint8Array,
  publicKey: Uint8Array,
  id?: Uint8Array
): Promise<Uint8Array> {
  const privateKeyImport = await (async () => {
    const x = bytes_to_base64urlsafe(publicKey.subarray(1, 33))
    const y = bytes_to_base64urlsafe(publicKey.subarray(33, 65))
    const d = bytes_to_base64urlsafe(privateKey)

    const jwk = {
      crv: 'P-256',
      d,
      ext: true,
      key_ops: ['deriveBits'],
      kty: 'EC',
      x,
      y,
    }

    return await crypto.subtle.importKey('jwk', jwk, {name: 'ECDH', namedCurve: 'P-256'}, true, [
      'deriveBits',
    ])
  })()
  const publicKeyLength = 65
  const message = data.slice(publicKeyLength)
  const ephemeralPublicKey = data.slice(0, publicKeyLength)
  const pubCryptoKey = await crypto.subtle.importKey(
    'raw',
    ephemeralPublicKey,
    {name: 'ECDH', namedCurve: 'P-256'},
    true,
    []
  )
  const sharedSecret = await crypto.subtle.deriveBits(
    {name: 'ECDH', public: pubCryptoKey},
    privateKeyImport,
    256
  )
  let sharedSecretCombined = new Uint8Array(sharedSecret.byteLength + (id?.byteLength ?? 0))
  sharedSecretCombined.set(new Uint8Array(sharedSecret), 0)
  if (id) {
    sharedSecretCombined.set(id, sharedSecret.byteLength)
  }
  const symmetricKey = await crypto.subtle.digest('SHA-256', sharedSecretCombined)
  return aesGcmDecrypt(message, new Uint8Array(symmetricKey))
}

function bytesToString(data: Uint8Array): string {
  if (!data) return ''
  const decoder = new TextDecoder()
  return decoder.decode(data)
}

function bytes_to_base64urlsafe(bytes: Uint8Array) {
  var base64urlsafe = bytes_to_base64(bytes)
    .replace(/=+$/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
  return base64urlsafe
}

function base64urlsafe_to_bytes(base64urlsafe: string): Uint8Array {
  if (!base64urlsafe) return new Uint8Array()

  const base64 = base64WebSafeToBase64(base64urlsafe)

  const bytes = base64_to_bytes(base64)
  return bytes
}


function base64WebSafeToBase64(base64WebSafe: string): string {
  let base64 = base64WebSafe.replace(/_/g, '/').replace(/-/g, '+')

  while (base64.length % 4) {
    base64 += '='
  }

  return base64
}

function base64WebSafeToHex(data: string): string {
  return base64ToHex(base64WebSafeToBase64(data))
}

function base64ToHex(data: string): string {
  let raw = atob(data)
  let hex = ''
  for (let i = 0; i < raw.length; i++) {
    let _hex = raw.charCodeAt(i).toString(16)
    hex += _hex.length == 2 ? _hex : '0' + _hex
  }
  return hex
}

function hexToBytes(data: string): Uint8Array {
  let bytes = []
  for (let c = 0; c < data.length; c += 2) bytes.push(parseInt(data.substr(c, 2), 16))
  return Uint8Array.from(bytes)
}