import React from 'react'
import language from '../../../../../shared/locale'
import {closeFormFiller} from '../../../misc/closeFormFiller'
import KeeperExtensionSimple, {KeeperExtensionSimpleProps} from './KeeperExtensionSimple'

const KeeperRestrictedAlert: React.FC = () => {
  const props: KeeperExtensionSimpleProps = {
    message: language.translateThis(
      'feature_restricted_by_admin',
      'Feature Restricted by Keeper Admin'
    ),
    btnText: language.translateThis('dismiss', 'Dismiss'),
    btnHandler: closeFormFiller,
    handleCloseButton: closeFormFiller,
  }

  return <KeeperExtensionSimple {...props} />
}

export default KeeperRestrictedAlert
