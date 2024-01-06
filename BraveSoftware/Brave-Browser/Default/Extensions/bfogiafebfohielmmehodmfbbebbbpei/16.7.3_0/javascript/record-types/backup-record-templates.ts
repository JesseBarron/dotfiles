import type {RecordType} from './record-types'

export function getBackupRecordTemplate(type: string): RecordType | null {
  switch (type) {
    case 'login':
      return loginRecordTemplate
    case 'bankCard':
      return bankCardRecordTemplate
    case 'address':
      return addressRecordTemplate
    case 'general':
      return generalRecordTemplate
  }

  return null
}

export const loginRecordTemplate: RecordType = {
    "$id": "login",
    "categories": [
        "login"
    ],
    "recordTypeId": 1,
    "scope": 0,
    "description": "Login template",
    "fields": [
        {
            "$ref": "passkey"
        },
        {
            "$ref": "login"
        },
        {
            "$ref": "password"
        },
        {
            "$ref": "url"
        },
        {
            "$ref": "fileRef"
        },
        {
            "$ref": "oneTimeCode"
        }
    ]
}

export const bankCardRecordTemplate: RecordType = {
    "$id": "bankCard",
    "categories": [
        "payment"
    ],
    "recordTypeId": 18,
    "scope": 0,
    "description": "Bank card template",
    "fields": [
        {
            "$ref": "paymentCard"
        },
        {
            "$ref": "text",
            "label": "cardholderName"
        },
        {
            "$ref": "pinCode"
        },
        {
            "$ref": "addressRef"
        },
        {
            "$ref": "fileRef"
        }
    ]
}

export const addressRecordTemplate: RecordType = {
    "$id": "address",
    "categories": [
        "address"
    ],
    "recordTypeId": 14,
    "scope": 0,
    "description": "Address template",
    "fields": [
        {
            "$ref": "address"
        },
        {
            "$ref": "fileRef"
        }
    ]
}

export const generalRecordTemplate: RecordType = {
    "$id": "general",
    "categories": [
        "login"
    ],
    "recordTypeId": 32,
    "scope": 0,
    "description": "Legacy template",
    "fields": [
        {
            "$ref": "login"
        },
        {
            "$ref": "password"
        },
        {
            "$ref": "url"
        },
        {
            "$ref": "oneTimeCode"
        },
        {
            "$ref": "fileRef"
        }
    ]
}
