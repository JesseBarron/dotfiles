import type { Records } from "@keeper-security/keeperapi"

export interface RecordType {
  $id: string,
  categories?: string[],
  description?: string,
  fields: FieldRef[],
  recordTypeId: number
  scope: Records.RecordTypeScope
}

export interface FieldRef {
  $ref: string,
  label?: string
  required?: boolean
  privacyScreen?: boolean
  enforceGeneration?: boolean
  complexity?: {
    length: number
    caps: number
    lowercase: number
    digits: number
    special: number
  }
}

export function isRecordType (data: any): data is RecordType {
  return typeof data === 'object' &&
    typeof data.$id === 'string' &&
    Array.isArray(data.fields) && 
    (data.fields as any[]).every(isFieldRef)
}

export function isFieldRef(data: any): data is FieldRef {
  return typeof data === 'object' && typeof data.$ref === 'string'
}
