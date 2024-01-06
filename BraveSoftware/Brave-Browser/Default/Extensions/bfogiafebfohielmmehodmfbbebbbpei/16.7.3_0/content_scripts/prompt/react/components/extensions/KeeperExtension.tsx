import React from 'react'
import KeeperLoginHelperExtension from './KeeperLoginHelperExtension'
import KeeperPasskeyCreateExtension from './KeeperPasskeyCreateExtension'
import KeeperPasskeyGetExtension from './KeeperPasskeyGetExtension'
import KeepePasswordHelperExtension from './KeepePasswordHelperExtension'
import KeeperReviewSavedRecordExtension from './KeeperReviewSavedRecordExtension'
import {CsProvider} from '@content_scripts/prompt/redux/helpers/CsProvider'
import {useWidth} from '../../hooks/useWidth'
import type {Record} from 'custom/javascript/bg/src/types/cache/record'
import {RecordHints} from '@content_scripts/prompt/inner/class-functions/records'
import {setExtensionPayload} from '../../utils/extensionPayloads'
import {KeeperExtensionName} from '../../types'
import {KeeperPasskeyGetSuccessExtension} from './PasskeyGetSuccess'
import {KeeperPasskeyCreateSuccessExtension} from './PasskeyCreateSuccess'
import KeeperLoginPromptExtension from './KeeperLoginPromptExtension'
import KeeperRestrictedAlert from './KeeperRestrictedAlert'

export type KeeperExtensionProps = {
  width: number
  name: KeeperExtensionName
  lockId?: string
  inputType?: string
  referrer?: string
  hints?: RecordHints
  webauthn?: string
  callerOrigin?: string
  callerFrameId?: number
  records?: Record[]
}

const keeperExtensions: {[key: string]: React.FC} = {
  loginHelper: KeeperLoginHelperExtension,
  passwordHelper: KeepePasswordHelperExtension,
  reviewSavedRecord: KeeperReviewSavedRecordExtension,
  loginPrompt: KeeperLoginPromptExtension,
  restrictedAlert: KeeperRestrictedAlert,
  passkeyCreate: KeeperPasskeyCreateExtension,
  passkeyCreateSuccess: KeeperPasskeyCreateSuccessExtension,
  passkeyGet: KeeperPasskeyGetExtension,
  passkeyGetSuccess: KeeperPasskeyGetSuccessExtension,
}

const KeeperExtension: React.FC<KeeperExtensionProps> = (props) => {
  const {name, width} = props

  if (!keeperExtensions.hasOwnProperty(name)) return null

  useWidth(width)
  setExtensionPayload(props)

  const Extension: React.FC = keeperExtensions[name]

  return <Extension />
}

type KeeperExtensionWrapperProps = {
  data: KeeperExtensionProps
}

const WrappedInitKeeperExtension: React.FC<KeeperExtensionWrapperProps> = (props) => {
  return (
    <CsProvider>
      <KeeperExtension {...props.data} />
    </CsProvider>
  )
}

export default WrappedInitKeeperExtension
