import Login from '@shared/svgMaker/login'
import {PasskeySVG} from '@shared/svgMaker/passkeyIcon'
import classNames from 'classnames'
import React, {ReactElement} from 'react'

type PasskeyRecordItemProps = {
  title: string
  username: string
  className?: string
  trailingButton?: ReactElement
  onClick?: () => void
  hidePasskeyIcon?: boolean
  itemRef?: React.RefObject<HTMLDivElement>
}

export const PasskeyRecordItem: React.FC<PasskeyRecordItemProps> = (props) => {
  const {title, username, trailingButton, className, onClick, hidePasskeyIcon, itemRef} = props

  const classes = classNames('passkey-record-item', className)

  return (
    <div ref={itemRef} className={classes} onClick={onClick}>
      <div className="login-svg-container">
        <Login height={24} width={24} svgColorName={'#1B74DA'} />
      </div>

      <div className="passkey-record-item-info">
        <div className="passkey-info-title">{title}</div>
        <div className="passkey-info-username">
          {!hidePasskeyIcon && <PasskeySVG />}
          <span>{username}</span>
        </div>
      </div>

      {!!trailingButton && trailingButton}
    </div>
  )
}
