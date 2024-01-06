import React from 'react'
import {promptAliases} from '../../../redux/aliases'
import {closeInputHelper} from '../../../../misc_functions/elementHelpers/launchInputHelper'
import PasswordInputHelper from '../../inputHelpers/PasswordInputHelper'
import BaseKeeperExtension from './BaseKeeperExtension'
import {useCsStoreDispatch} from '@content_scripts/prompt/redux/csProxyStoreContext'
import {getExtensionPayload} from '../../utils/extensionPayloads'

const KeepePasswordHelperExtension: React.FC = () => {
  const csDispatch = useCsStoreDispatch()

  const {lockId = ''} = getExtensionPayload()

  const handleCloseButton = () => {
    csDispatch(promptAliases.setPopupSuppressed('password'))
    closeInputHelper()
  }
  const content = <PasswordInputHelper lockId={lockId} />

  return <BaseKeeperExtension handleCloseButton={handleCloseButton} content={content} />
}

export default KeepePasswordHelperExtension
