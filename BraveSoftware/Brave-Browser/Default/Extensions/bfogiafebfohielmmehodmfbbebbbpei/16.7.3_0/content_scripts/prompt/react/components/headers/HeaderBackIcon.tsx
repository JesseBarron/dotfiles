import React from 'react'
import ReactDOM from 'react-dom'
import locale from '../../../../../shared/locale'
import {getExtensionPayload} from '../../utils/extensionPayloads'
import KeeperExtension, {KeeperExtensionProps} from '../extensions/KeeperExtension'
import ChevronLeft from '@shared/svgMaker/chevronLeft'

const HeaderBackIcon: React.FC = () => {
  const direction = locale.useRTL() ? 'rtl' : 'ltr'

  const handleClick = () => {
    const data: KeeperExtensionProps = {
      ...getExtensionPayload(),
      width: 310,
      name: 'modeSelector',
    }

    const keeperExtension = React.createElement(KeeperExtension, {data})

    ReactDOM.render(keeperExtension, document.getElementById('keeper-extension-root'))
  }

  return (
    <div
      id="popup-back-button-container"
      role="button"
      className={direction}
      aria-label="Back button."
      tabIndex={0}
      onClick={handleClick}
    >
      <ChevronLeft width={24} />
      <div className="back-content">Back</div>
    </div>
  )
}

export default HeaderBackIcon
