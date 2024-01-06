import React, {ReactNode} from 'react'
import CloseIcon from '../../../../../../shared/svgMaker/close'
import {keyIsEnter} from '../../../../../../shared/a11y/index'
import {SVGMaker} from '../../../../../../shared/svgMaker'
import CC from '../../../../../../shared/svgMaker/cc'
import Address from '../../../../../../shared/svgMaker/address'
import MoreVert from '../../../../../../shared/svgMaker/moreVert'
import {ModeSelectorTabIcons} from '../../../types'
import VaultIcon from '@shared/svgMaker/VaultIcon'

type KeeperIconName = 'closeIcon' | 'moreIcon' | ModeSelectorTabIcons

const iconComponents: {
  [key: string]: React.FC<SVGMaker>
} = {
  closeIcon: CloseIcon,
  vaultIcon: VaultIcon,
  ccIcon: CC,
  addressIcon: Address,
  moreIcon: MoreVert,
}

/**
 * Keeper Icon Button in Keeper Extension Header component
 */
type KeeperIconButtonProps = {
  id?: string
  type: KeeperIconName
  className?: string
  role?: string
  ariaLable?: string
  ariaHasPopup?: boolean
  style?: any
  tabIndex?: number
  isDisabled?: boolean
  overlayShadow?: boolean
  onClick?: () => void
  children?: ReactNode
}

const KeeperIconButton: React.FC<KeeperIconButtonProps> = (props) => {
  const {
    id,
    type,
    className = '',
    role = 'button',
    ariaLable = '',
    ariaHasPopup,
    style = {},
    tabIndex = 0,
    isDisabled = false,
    overlayShadow = false,
    onClick,
    children = null,
  } = props

  if (!iconComponents.hasOwnProperty(type)) return null

  const IconComponent: React.FC<SVGMaker> = iconComponents[type]

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onClick && onClick()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && keyIsEnter(e.code)) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      id={id}
      className={className}
      onClick={handleClick}
      role={role}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={ariaLable}
      aria-haspopup={ariaHasPopup}
      style={{...style, cursor: isDisabled ? 'not-allowed' : 'pointer'}}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
    >
      <IconComponent className={overlayShadow ? 'focus' : ''} />
      {children}
    </div>
  )
}

export default KeeperIconButton
