import React from 'react'
import {promptAliases} from '../../../redux/aliases'
import {closeInputHelper} from '../../../../misc_functions/elementHelpers/launchInputHelper'
import LoginInputHelper from '../../inputHelpers/LoginInputHelper'
import BaseKeeperExtension from './BaseKeeperExtension'
import {useCsStoreDispatch} from '@content_scripts/prompt/redux/csProxyStoreContext'
import {getExtensionPayload} from '../../utils/extensionPayloads'

const KeeperLoginHelperExtension: React.FC = () => {
  const csDispatch = useCsStoreDispatch()

  const {lockId = '', inputType} = getExtensionPayload()

  const handleCloseButton = () => {
    csDispatch(promptAliases.setPopupSuppressed('login'))
    closeInputHelper()
  }
  const content = <LoginInputHelper lockId={lockId} inputType={inputType} />

  return <BaseKeeperExtension handleCloseButton={handleCloseButton} content={content} />
}

export default KeeperLoginHelperExtension
