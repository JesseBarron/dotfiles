import locale from '@shared/locale'
import React from 'react'
import {closeFormFiller} from '../../../misc/closeFormFiller'
import {PasskeySuccess} from '../../passkeys/PasskeySuccess'
import {KeeperHeaderOptions} from '../../types'
import BaseKeeperExtension from './BaseKeeperExtension'

export const KeeperPasskeyGetSuccessExtension: React.FC = () => {
  const message = locale.translateThis('log_in_successful', 'Log In Successful')
  const content = <PasskeySuccess message={message} />

  return (
    <BaseKeeperExtension
      handleCloseButton={closeFormFiller}
      content={content}
      headerOption={KeeperHeaderOptions.None}
    />
  )
}
