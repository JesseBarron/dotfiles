import React from 'react'
import BaseKeeperExtension from './BaseKeeperExtension'
import KeeperButton from '../elements/buttons/KeeperButton'
import {enterKeyboardFn} from '../../../../../shared/a11y'
import {closeFormFiller} from '@content_scripts/prompt/misc/closeFormFiller'

export type KeeperExtensionSimpleProps = {
  message: string
  btnText: string
  btnHandler: () => void
  handleCloseButton?: () => void
}

const Content: React.FC<KeeperExtensionSimpleProps> = (props) => {
  const {message, btnText, btnHandler} = props
  return (
    <div className="keeper-extension-simple">
      <div className="keeper-extension-simple-message">{message}</div>
      <KeeperButton
        textContent={btnText}
        className="focus-visible"
        onClick={btnHandler}
        onKeydown={enterKeyboardFn}
      />
    </div>
  )
}

const KeeperExtensionSimple: React.FC<KeeperExtensionSimpleProps> = (props) => {
  const {handleCloseButton = closeFormFiller} = props
  return (
    <BaseKeeperExtension
      handleCloseButton={handleCloseButton}
      useClassicHeaderTheme={true}
      content={<Content {...props} />}
    />
  )
}

export default KeeperExtensionSimple
