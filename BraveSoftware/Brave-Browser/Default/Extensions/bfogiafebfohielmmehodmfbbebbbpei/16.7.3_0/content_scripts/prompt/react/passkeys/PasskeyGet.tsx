import {closeFormFiller} from '@content_scripts/prompt/misc/closeFormFiller'
import {postWebauthnResponse} from '@content_scripts/webauthn/postWebauthnResponse'
import locale from '@shared/locale'
import {passkeyCreatedDateSort} from '@shared/Search/Sort'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import type {RecordV3} from '../../../../javascript/bg/src/types/cache/record'
import {extractPasskeyField} from '@shared/Records/record-types-utils'
import {webauthnReviver} from '../../../webauthn/util'
import {useWebauthnTimeout} from '../hooks/useWebauthnTimeout'
import PasskeyChoices from './PasskeyChoices'
import {getErrorMessage, PasskeyError} from './PasskeyError'
import {PasskeyRecordItem} from './PasskeyRecordItem'

export type PasskeyGetProps = {
  webauthn: string
  callerOrigin: string
  callerFrameId: number
  records: RecordV3[]
}

const PasskeyGet: React.FC<PasskeyGetProps> = (props) => {
  const credential = useRef<PublicKeyCredential | null>()
  const [error, setError] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const {callerOrigin, callerFrameId} = props

  const options: CredentialRequestOptions = useMemo(() => {
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

  const onCancel = () => {
    closeFormFiller()
  }

  const onConfirm = async (record: RecordV3) => {
    try {
      const passkey = extractPasskeyField(record)?.value[0]
      if (!passkey) {
        throw new Error(`Missing passkey for record ${record.record_uid}`)
      }

      const {privateKey, credentialId, signCount, userId} = passkey

      const {signAssertion} = await import('passkey')

      // sign challenge
      credential.current = await signAssertion(
        options,
        {
          privateKey,
          count: signCount,
          id: credentialId,
          userId,
        },
        callerOrigin
      )

      // Send response
      postWebauthnResponse(`webauthn-get-response`, credential.current, callerFrameId)

      // Close
      closeFormFiller()
    } catch (error) {
      setError(getErrorMessage(error))
    }
  }

  // Update header text
  useEffect(() => {
    const headerTitle = document.getElementById('passkey-header-title')
    if (headerTitle) {
      headerTitle.textContent = (() => {
        if (error) {
          return locale.translateThis('Error')
        } else {
          return locale.translateThis('log_in_with_passkey', 'Log in with Passkey')
        }
      })()
    }
  }, [error])

  const sortedRecords = useMemo<RecordV3[]>(() => {
    return props.records.sort(passkeyCreatedDateSort)
  }, [props.records])

  // END HOOKS

  // If error, show error screen
  if (error) {
    return <PasskeyError error={error} />
  }

  // If multiples found and option selected
  if (showOptions) {
    return <PasskeyChoices records={sortedRecords} onConfirm={onConfirm} onCancel={onCancel} />
  }

  // Default to newest passkey
  const record = sortedRecords[0]
  const passkey = extractPasskeyField(record)?.value[0]

  return (
    <div className="passkey-prompt-content">
      <PasskeyRecordItem
        className="shadow"
        title={record.title}
        username={passkey?.username || ''}
      />

      <div className="passkey-prompt-buttons">
        <button className="focus-visible" onClick={onConfirm.bind(null, record)}>
          {locale.translateThis('use_passkey', 'Use Passkey')}
        </button>
        {props.records.length > 1 && (
          <button className="focus-visible" onClick={setShowOptions.bind(null, true)}>
            {locale.translateThis('other_log_in_options', 'Other Log In Options')}
          </button>
        )}
      </div>
    </div>
  )
}

export default PasskeyGet
