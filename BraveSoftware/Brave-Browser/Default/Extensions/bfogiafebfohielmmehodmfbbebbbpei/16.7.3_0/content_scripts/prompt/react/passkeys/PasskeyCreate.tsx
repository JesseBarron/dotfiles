import {constants} from '@content_scripts/contentScriptsConstants'
import iframeUtil from '@content_scripts/prompt/iframeUtil'
import {closeFormFiller} from '@content_scripts/prompt/misc/closeFormFiller'
import {
  useCsStoreDispatch,
  useCsStoreSelector,
} from '@content_scripts/prompt/redux/csProxyStoreContext'
import {postWebauthnResponse} from '@content_scripts/webauthn/postWebauthnResponse'
import {keyIsEnter} from '@shared/a11y'
import locale from '@shared/locale'
import {canCreateLoginRecords, getLoginTemplateId} from '@shared/Redux/selectors'
import {passkeyCreatedDateSort, recordModifiedTimeSort} from '@shared/Search/Sort'
import Edit from '@shared/svgMaker/edit'
import _cloneDeep from 'lodash/cloneDeep'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import type {RecordV3} from '../../../../javascript/bg/src/types/cache/record'
import {
  applyRecordTemplate,
  createRecord,
  extractLoginField,
  extractPasskeyField,
  hasPasskey,
  updateTypedRecordField,
} from '@shared/Records/record-types-utils'
import getOriginAndPath from '../../../../shared/Misc/getOriginAndPath'
import {bufferToBase64UrlSafe, webauthnReviver} from '../../../webauthn/util'
import {promptAliases} from '../../redux/aliases'
import {getThisTabInfo} from '../../redux/getThisTabState'
import {useRecordType} from '../hooks/useRecordType'
import {useUploadResponse} from '../hooks/useUploadResponse'
import {useWebauthnTimeout} from '../hooks/useWebauthnTimeout'
import {getErrorMessage, PasskeyError} from './PasskeyError'
import {PasskeyRecordEditor} from './PasskeyRecordEditor'
import {PasskeyRecordItem} from './PasskeyRecordItem'
import {PasskeyRecordSelect} from './PasskeyRecordSelect'

export type PasskeyCreateProps = {
  webauthn: string
  callerOrigin: string
  callerFrameId: number
  records: RecordV3[]
}

const PasskeyCreate: React.FC<PasskeyCreateProps> = (props) => {
  const [error, setError] = useState('')
  const [record, setRecord] = useState<RecordV3 | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  const loginTemplateId = useSelector(getLoginTemplateId)
  const canCreate = useSelector(canCreateLoginRecords)
  const template = useRecordType(record?.type || loginTemplateId)
  const credential = useRef<PublicKeyCredential | null>(null)
  const tabInfo = useCsStoreSelector(getThisTabInfo)
  const csDispatch = useCsStoreDispatch()
  const {callerOrigin, callerFrameId} = props

  const options: CredentialCreationOptions = useMemo(() => {
    try {
      return JSON.parse(props.webauthn, webauthnReviver)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [props.webauthn])

  // Timeout
  useWebauthnTimeout(options, () => {
    postWebauthnResponse('webauthn-timed-out', null, callerFrameId)
    closeFormFiller()
  })

  const pubkeyUser = options.publicKey?.user
  const username: string = pubkeyUser?.name || ''

  const rpId: string = useMemo(() => {
    if (options.publicKey?.rp.id) {
      return options.publicKey.rp.id
    }

    try {
      // Per spec: if rp.id is empty, use domain from caller origin
      return new URL(callerOrigin).hostname
    } catch {
      return ''
    }
  }, [])

  // Check excludeCredentials
  useEffect(() => {
    const excludeCredentials: Set<string> = new Set(
      (options.publicKey?.excludeCredentials || []).map((cred) => {
        return bufferToBase64UrlSafe(cred.id)
      })
    )
    const alreadyExists: boolean = props.records.some((record) => {
      const passkey = extractPasskeyField(record)?.value[0]
      if (passkey) {
        const {credentialId} = passkey
        return excludeCredentials.has(credentialId)
      }

      return false
    })
    if (alreadyExists) {
      setAlreadyRegistered(true)
      setError(
        locale.translateThis(
          'passkey_already_registered_desc',
          'A passkey for this account is already registered with Keeper.'
        )
      )
    }
  }, [props.records, options.publicKey?.excludeCredentials])

  // Filter and sort passed in records
  const records = useMemo(() => {
    const userId: string = bufferToBase64UrlSafe(pubkeyUser!.id)
    const filteredRecords = props.records.filter(passkeyOptionsFilter.bind(null, rpId, userId))
    const matchCounts = getMatchCounts(username, filteredRecords)
    return filteredRecords.sort(passkeyOptionsSort.bind(null, matchCounts))
  }, [props.records])

  // Pick default based on closest match (already sorted)
  useEffect(() => {
    const defaultRecord = records[0]
    if (defaultRecord) {
      setRecord(defaultRecord)
    }
  }, [records])

  // Create record if set to create new record
  useEffect(() => {
    if (!template || template.$id !== loginTemplateId) return

    if (!record) {
      const title = options.publicKey?.rp.name || rpId
      const url: string = getOriginAndPath(tabInfo?.url || '')
      const newRecord = createRecord(template, {
        record_uid: '',
        title,
        username: username.includes('***') ? '' : username,
        password: '',
        url,
      })
      setRecord(newRecord)
    }
  }, [record?.record_uid, template])

  useUploadResponse((savedRecord) => {
    csDispatch(promptAliases.clearUploadState())
    setRecord(savedRecord as RecordV3)
    setShowEditor(false)
    postWebauthnResponse(`webauthn-create-response`, credential.current, callerFrameId)
    iframeUtil.loadExtensionContents({
      name: 'passkeyCreateSuccess',
      width: constants.PASSKEY_SCREEN_WIDTH,
      lockId: '',
    })
  }, setError)

  const onConfirm = async () => {
    if (!record && !canCreate) {
      return iframeUtil.loadExtensionContents({
        name: 'restrictedAlert',
        width: 310,
        lockId: '',
      })
    }

    try {
      if (!record) {
        throw new Error('missing record selection')
      }

      const {generateKeyPair, signAttestation} = await import('passkey')

      // Create credential
      const {publicKey, privateKey} = await generateKeyPair()

      // Sign Webauthn request
      credential.current = await signAttestation(
        options,
        {
          publicKey: publicKey,
        },
        callerOrigin
      )

      // Apply passkey to currently selected record
      const passkeyRecord: RecordV3 = _cloneDeep(record)
      const userId: string = bufferToBase64UrlSafe(pubkeyUser!.id)
      if (template && template.$id === record.type) {
        applyRecordTemplate(template, passkeyRecord)
      }
      updateTypedRecordField(passkeyRecord, {
        type: 'passkey',
        value: [
          {
            privateKey,
            relyingParty: rpId,
            username,
            userId,
            credentialId: credential.current.id,
            signCount: 0,
            createdDate: Date.now(),
          },
        ],
      })

      // upload the record
      csDispatch(promptAliases.setAndRequestUploadRecord(passkeyRecord))
    } catch (error) {
      setError(getErrorMessage(error))
    }
  }

  // get header text
  const headerText = useMemo<string>(() => {
    if (alreadyRegistered) {
      return locale.translateThis('passkey_already_registered', 'Passkey Already Registered')
    }
    if (error) {
      return locale.translateThis('Error')
    }
    if (!record?.record_uid) {
      return locale.translateThis('create_login_with_passkey', 'Create Login with Passkey')
    }
    if (hasPasskey(record)) {
      return locale.translateThis('update_existing_passkey', 'Update Existing Passkey')
    }
    return locale.translateThis('add_passkey_to_login', 'Add Passkey to Login')
  }, [error, record?.record_uid])

  // get button text
  const buttonText = useMemo<string>(() => {
    if (!record?.record_uid) {
      return locale.translateThis('create_passkey', 'Create Passkey')
    }
    if (hasPasskey(record)) {
      return locale.translateThis('update_passkey', 'Update Passkey')
    }
    return locale.translateThis('add_passkey', 'Add Passkey')
  }, [record?.record_uid])

  // Update header text
  useEffect(() => {
    const headerTitle = document.getElementById('passkey-header-title')
    if (headerTitle) {
      headerTitle.textContent = headerText
    }
  }, [headerText])

  const selectOnChange = useCallback((uid: string) => {
    const record = records.find(({record_uid}) => record_uid === uid)
    if (record) {
      setRecord(record)
    } else {
      setRecord(null)
    }
  }, [])

  // END EFFECTS

  // If error, show error screen
  if (error) {
    return <PasskeyError error={error} />
  }

  return (
    <div className="passkey-prompt-content">
      {/* record select */}
      {records.length > 0 && (
        <PasskeyRecordSelect
          selectedUid={record?.record_uid ?? ''}
          records={records}
          onSelect={selectOnChange}
        />
      )}

      {/* passkey description / passkey record editor */}
      {(() => {
        if (showEditor && record) {
          return (
            <PasskeyRecordEditor
              record={record}
              onChange={setRecord}
              username={username}
              relyingParty={rpId}
            />
          )
        } else {
          return (
            <PasskeyRecordItem
              className="shadow"
              title={record?.title || options.publicKey?.rp.name || rpId}
              username={username}
              trailingButton={
                <div
                  className="edit focus-visible"
                  role="button"
                  aria-label="Edit"
                  tabIndex={0}
                  onClick={setShowEditor.bind(null, true)}
                  onKeyDown={(e) => {
                    if (keyIsEnter(e.key)) {
                      setShowEditor(true)
                    }
                  }}
                >
                  <Edit />
                </div>
              }
            />
          )
        }
      })()}

      {/* buttons */}
      <div className="passkey-prompt-buttons">
        <button className="focus-visible" onClick={onConfirm}>
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default PasskeyCreate

function passkeyOptionsFilter(rpId: string, userId: string, record: RecordV3) {
  if (record.can_edit === false) {
    return false
  }

  const passkey = extractPasskeyField(record)?.value[0]
  if (passkey) {
    // If record has a passkey, we only allow replacing if user.id and rp.id match
    return passkey.relyingParty === rpId && passkey.userId === userId
  }

  return true
}

function getMatchCounts(username: string, records: RecordV3[]): Map<string, number> {
  return records.reduce((acc, record) => {
    const login = extractLoginField(record)?.value[0]
    if (login && acc.get(login) === undefined) {
      acc.set(record.record_uid, getMatchingChars(username, login))
    }
    return acc
  }, new Map())
}

function getMatchingChars(a: string, b: string) {
  const length = Math.min(a.length, b.length)
  let i = 0
  while (a[i] === b[i] && i < length) {
    i++
  }
  return i
}

function passkeyOptionsSort(loginMatchCounts: Map<string, number>, a: RecordV3, b: RecordV3) {
  const aHasPasskey = hasPasskey(a)
  const bHasPasskey = hasPasskey(b)

  // matching passkey
  if (bHasPasskey && !aHasPasskey) {
    return 1
  }
  if (aHasPasskey && !bHasPasskey) {
    return -1
  }

  // matching login count
  const aMatchCount = loginMatchCounts.get(a.record_uid) ?? 0
  const bMatchCount = loginMatchCounts.get(b.record_uid) ?? 0
  if (bMatchCount > aMatchCount) {
    return 1
  }
  if (aMatchCount > bMatchCount) {
    return -1
  }

  // record owner
  if (b.owner && !a.owner) {
    return 1
  }
  if (a.owner && !b.owner) {
    return -1
  }

  // passkey created date
  if (aHasPasskey && bHasPasskey) {
    return passkeyCreatedDateSort(a, b)
  }

  // record date modified
  return recordModifiedTimeSort(a, b)
}
