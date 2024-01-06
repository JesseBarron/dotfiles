import React from 'react'
import language from '../../../../../shared/locale'
import {openVault} from '../../../../../shared/helpers'
import {csDispatch} from '../../../../csStoreProxy'
import {sharedAliases} from '../../../../../shared/Redux/aliases'
import {closeFormFiller} from '../../../misc/closeFormFiller'
import KeeperExtensionSimple, {KeeperExtensionSimpleProps} from './KeeperExtensionSimple'

const handleVaultLoginButton = () => openVault()()

const handleDontShowButton = () => {
  csDispatch(sharedAliases.setLoginPrompt(false))
  closeFormFiller()
}

const KeeperLoginPromptExtension: React.FC = () => {
  const props: KeeperExtensionSimpleProps = {
    message: language.translateThis('keeper_login', 'Log in to Keeper to fill credentials.'),
    btnText: language.translateThis('log_in', 'Log In'),
    btnHandler: handleVaultLoginButton,
    handleCloseButton: handleDontShowButton,
  }

  return <KeeperExtensionSimple {...props} />
}

export default KeeperLoginPromptExtension
