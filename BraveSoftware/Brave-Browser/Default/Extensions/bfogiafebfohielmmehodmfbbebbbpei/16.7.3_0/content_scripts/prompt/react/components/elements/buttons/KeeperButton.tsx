import React, {useState} from 'react'
import classNames from 'classnames'

/******************************************************************************
 * KeeperButton
 *
 * Corresponds to ['keeper-button', initKeeperButton] at innerInitFunctionMap.
 * Be considered as a base button.
 *****************************************************************************/
type KeeperButtonProps = {
  id?: string
  role?: string
  textContent?: string
  className?: string
  style?: any
  plainStyle?: string
  tabIndex?: number
  ariaLabel?: string
  onClick?: () => void
  onKeydown?: (e: KeyboardEvent | React.KeyboardEvent) => void
}

enum ActiveStatus {
  Default = '',
  Active = 'keeper-button-active',
  Disable = 'keeper-button-disabled',
}

const KeeperButton: React.FC<KeeperButtonProps> = (props) => {
  const {
    id,
    role = 'button',
    textContent = '',
    className = '',
    style = {},
    plainStyle,
    tabIndex = 0,
    ariaLabel = '',
    onKeydown,
    onClick,
  } = props

  const [activeStatus, setActiveStatus] = useState<ActiveStatus>(ActiveStatus.Default)

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setActiveStatus(ActiveStatus.Active)
  }

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    setActiveStatus(ActiveStatus.Default)
  }

  const handleMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    setActiveStatus(ActiveStatus.Default)
  }

  const classname = classNames(
    'keeper-button',
    className,
    activeStatus,
    plainStyle ? 'keeper-button-transparent' : ''
  )

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    onClick && onClick()
  }

  return (
    <div
      id={id}
      role={role}
      className={classname}
      style={style}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
      onKeyDown={onKeydown}
    >
      {textContent}
    </div>
  )
}

export default KeeperButton
