import React from 'react'
import {useSelector} from 'react-redux'
import {getTheme} from '../../../../../shared/Redux/selectors'
import KeeperHeaderLogo from '../elements/logos/KeeperHeaderLogo'
import KeeperIconButton from '../elements/buttons/KeeperIconButton'
import HeaderMoreIcon from './HeaderMoreIcon'
import HeaderBackIcon from './HeaderBackIcon'
import {KeeperHeaderOptions} from '../../types'

type KeeperExtensionHeaderProps = {
  headerOption?: KeeperHeaderOptions
  handleCloseButton: () => void
  leadingHeaderIcon?: React.ReactNode
}

const KeeperExtensionHeader: React.FC<KeeperExtensionHeaderProps> = (props) => {
  const {theme, mode} = useSelector(getTheme)
  const {headerOption, handleCloseButton, leadingHeaderIcon} = props

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={`keeper-header keeper-theme-${theme} ${mode}-mode`}
    >
      {headerOption !== KeeperHeaderOptions.BackIcon && <KeeperHeaderLogo />}
      {headerOption === KeeperHeaderOptions.BackIcon && <HeaderBackIcon />}
      {headerOption === KeeperHeaderOptions.MoreIcon && <HeaderMoreIcon />}
      {leadingHeaderIcon}
      <KeeperIconButton
        type="closeIcon"
        className="keeper-close focus-visible"
        role="button"
        aria-label="Exit Button. Close Keeper Popup"
        onClick={handleCloseButton}
      />
    </div>
  )
}

export default KeeperExtensionHeader
