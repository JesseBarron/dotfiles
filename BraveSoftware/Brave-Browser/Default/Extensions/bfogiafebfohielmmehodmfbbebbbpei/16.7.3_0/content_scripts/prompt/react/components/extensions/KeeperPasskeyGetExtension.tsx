import React from 'react'
import BaseKeeperExtension from './BaseKeeperExtension'
import PasskeyGet from '../../passkeys/PasskeyGet'
import PasskeyHeader from '../../passkeys/PasskeyHeader'
import type {RecordV3} from '../../../../../javascript/bg/src/types/cache/record'
import {closeFormFiller} from '@content_scripts/prompt/misc/closeFormFiller'
import {getExtensionPayload} from '../../utils/extensionPayloads'

const KeeperPasskeyCreateExtenson: React.FC = () => {
  const {webauthn = '', callerOrigin = '', callerFrameId = 0, records = []} = getExtensionPayload()

  let headerIcon = <PasskeyHeader />

  let content = (
    <PasskeyGet
      webauthn={webauthn}
      callerOrigin={callerOrigin}
      callerFrameId={callerFrameId}
      records={records as RecordV3[]}
    />
  )

  return (
    <BaseKeeperExtension
      handleCloseButton={closeFormFiller}
      content={content}
      leadingHeaderIcon={headerIcon}
    />
  )
}

export default KeeperPasskeyCreateExtenson
