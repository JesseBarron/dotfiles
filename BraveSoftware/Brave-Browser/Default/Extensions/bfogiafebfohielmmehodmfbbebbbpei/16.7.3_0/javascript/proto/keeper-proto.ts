/**
 * Special proto objects which help to normalize the use of protobufs.
 */

import { bytes_to_utf8, utf8_to_bytes } from "../bg/src/crypto/bgCryptoMethods"


 /**
  * Use to act upon json objects.
  */
export const JsonProto = {
  create: (object: Object) => object,
  encode: (object: Object) => ({
    finish: () => utf8_to_bytes(JSON.stringify(object))
  }),
  decode: (bytes: Uint8Array) => {
    return JSON.parse(bytes_to_utf8(bytes))
  },
  verify: (obj: Object) => {
    try {
      JSON.stringify(obj)
    } catch (err) {
      return err
    }
    return null
  }
}

/**
 * Use when nothing is needed.
 */
export const NullProto = {
  create: (object: any) => null,
  encode: (object: any) => ({
    finish: () => null
  }),
  decode: (bytes: any) => null,
  verify: (obj: any) => null
}
