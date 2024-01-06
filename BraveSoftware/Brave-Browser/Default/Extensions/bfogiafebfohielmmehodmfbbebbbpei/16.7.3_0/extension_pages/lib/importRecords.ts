import {parse} from 'csv-parse/browser/esm/sync'
import isURL from 'validator/lib/isURL'
import _chunk from 'lodash/chunk'
import {getTestLoginRecord} from '../../javascript/bg/src/detection/test/testData/testData'
import type {Record, RecordV3} from '../../javascript/bg/src/types/cache/record'
import {updateTypedRecordField} from '@shared/Records/record-types-utils'

export type ImportRecordsData = {
  fileContent: string
  fileType: string
}

export function importRecords(data: ImportRecordsData): Record[] {
  const {fileContent, fileType} = data

  switch (fileType) {
    case 'text/csv':
      return getRecordsFromUploadCSV(fileContent)
    default:
      throw new Error('Unsupported file type')
  }
}

function getRecordsFromUploadCSV(fileContent: string): Record[] {
  const records: Record[] = []

  const lines = parseCSV(fileContent)
  for (const recordData of lines) {
    // Keeper CSV format:
    // https://docs.keeper.io/user-guides/import-records-1/import-a-.csv-file#advanced-field-mapping
    const [folder, title, username, password, url, notes, sharedFolder] = recordData.slice(0, 7)
    if (!url) continue

    // primary fields
    const record: RecordV3 = getTestLoginRecord({
      title,
      username,
      password,
      url,
    })
    record.custom = []
    record.notes = notes

    // custom fields
    const customFields = recordData.slice(7)
    const customFieldPairs = _chunk(customFields, 2)
    for (const [name, value = ''] of customFieldPairs) {
      switch (true) {
        // check for OTP (exporter puts this in customs)
        case value.startsWith('otpauth://'):
          updateTypedRecordField(record, {
            type: 'oneTimeCode',
            value: [value],
          })
          break
        // check for custom URL
        case isURL(value):
          record.custom.push({
            label: name,
            type: 'url',
            value: [value],
          })
          break
        // custom text field
        default:
          record.custom.push({
            label: name,
            type: 'text',
            value: [value],
          })
      }
    }

    records.push(record)
  }

  return records
}

function parseCSV(content: string): string[][] {
  return parse(content, {
    relax_column_count: true, // because of custom fields
  })
}
