import locale from '@shared/locale'
import React from 'react'
import {closeFormFiller} from '../../../misc/closeFormFiller'
import {PasskeySuccess} from '../../passkeys/PasskeySuccess'
import {KeeperHeaderOptions} from '../../types'
import BaseKeeperExtension from './BaseKeeperExtension'

export const KeeperPasskeyCreateSuccessExtension: React.FC = () => {
  const message = locale.translateThis('keeper_passkey_created', 'Keeper Passkey Created')
  const content = <PasskeySuccess message={message} />

  return (
    <BaseKeeperExtension
      handleCloseButton={closeFormFiller}
      content={content}
      headerOption={KeeperHeaderOptions.None}
    />
  )
}
