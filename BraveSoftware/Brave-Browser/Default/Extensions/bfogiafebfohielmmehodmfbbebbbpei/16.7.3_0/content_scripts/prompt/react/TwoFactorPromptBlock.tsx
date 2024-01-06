import React, {useEffect, useRef, useState} from 'react'
import {ExpirePulldown} from './ExpirePulldown'
import {DuoBlock} from './DuoBlock'
import {DuoBlockProps} from './DuoBlock'
import {ExpirePulldownProps} from './ExpirePulldown'
import {WebAuthnBlock} from './WebAuthnBlock'
import locale, {translateThis} from '@shared/locale'
import TriangleWarning from '@shared/svgMaker/triangleWarning'
export type TwoFactorPromptBlockProps = Partial<DuoBlockProps & ExpirePulldownProps> & {
  validateInput?: (e: React.FormEvent) => void
  isDelete?: boolean
  isExpirePullDown?: boolean
  isPassword?: boolean
  isEyeball?: boolean
  isDuoBlock?: boolean
  twoFactorInfo?: string
  isShowWebAuthn?: boolean
  isWebAuthnBlock?: boolean
  isUseBackupButton?: boolean
  isPrimaryButtonDelete?: boolean
  isPrimaryButtonContent?: boolean
  isWebAuthnBlockDelete?: boolean
  isBackupButtonDelete?: boolean
  loginFailedMessage?: string
  onUseBackupButtonClicked?: () => void
  submitTwoFactorCode?: () => void
  onPrimaryButtonClicked?: () => void
}
export const TwoFactorPromptBlock = ({
  isPassword = false,
  validateInput,
  isDelete = false,
  isExpirePullDown = false,
  allowedTwoFactorDurations = [''],
  isDuoBlock = false,
  duoMessageContent = '',
  isPrimaryButtonContent = false,
  duoCapabilities = [''],
  isShowWebAuthn = false,
  isWebAuthnBlock = false,
  isUseBackupButton = false,
  isBackupButtonDelete = false,
  isPrimaryButtonDelete = false,
  isWebAuthnBlockDelete = false,
  loginFailedMessage = '',
  onButtonClicked = () => {},
  onUseBackupButtonClicked = () => {},
  submitTwoFactorCode = () => {},
  onPrimaryButtonClicked = () => {},
  twoFactorInfo = '',
}: TwoFactorPromptBlockProps) => {
  const inputRef = useRef(null)
  const [passwordIsShowing, setPasswordIsShowing] = useState<boolean>(isPassword)
  const [isPrimaryButtonDeleteState, setIsPrimaryButtonDeleteState] =
    useState<boolean>(isPrimaryButtonDelete)
  const [isShowWebAuthnState, setIsShowWebAuthnState] = useState<boolean>(isShowWebAuthn)
  const [isBackupButtonDeleteState, setIsBackupButtonDeleteState] =
    useState<boolean>(isBackupButtonDelete)
  const onEyeballClick = () => {
    setPasswordIsShowing(!passwordIsShowing)
  }
  useEffect(() => {
    if (inputRef.current == null) return
    ;(inputRef.current as HTMLInputElement).focus()
  }, [])
  return !isDelete ? (
    <div id="twofac" className="twofac">
      {isDuoBlock && (
        <DuoBlock
          duoMessageContent={duoMessageContent}
          duoCapabilities={duoCapabilities}
          onButtonClicked={onButtonClicked}
        />
      )}
      {!isShowWebAuthnState && (
        <label
          className="bottom_space row two_factor_info"
          htmlFor="two_factor_code"
          id="two_factor_info"
        >
          {twoFactorInfo}
        </label>
      )}
      {isWebAuthnBlock && isWebAuthnBlockDelete && <WebAuthnBlock />}
      {!passwordIsShowing
        ? !isShowWebAuthnState && (
            <>
              <input
                id="two_factor_code"
                onKeyUp={(e) => {
                  if (e.keyCode === 13) {
                    submitTwoFactorCode()
                  }
                }}
                placeholder="123456"
                autoFocus
                className="bottom_space ie_text_input"
                style={{backgroundImage: 'url(@css_image_root@/images/visibility_off.svg)'}}
                onInput={validateInput}
              />
              <div id="eyeball" onClick={onEyeballClick} class="visibility_off" />
            </>
          )
        : !isShowWebAuthnState && (
            <>
              <input
                ref={inputRef}
                id="two_factor_code"
                onKeyUp={(e) => {
                  if (e.keyCode === 13) {
                    submitTwoFactorCode()
                  }
                }}
                placeholder="123456"
                className="bottom_space ie_text_input"
                type="password"
                onInput={validateInput}
                style={{backgroundImage: 'url(@css_image_root@/images/visibility.svg)'}}
              />
              <div id="eyeball" onClick={onEyeballClick} />
            </>
          )}
      {isExpirePullDown ? (
        <ExpirePulldown allowedTwoFactorDurations={allowedTwoFactorDurations} />
      ) : (
        <label className="ie_label bottom_space">
          <input id="two_factor_dont_ask" type="checkbox" />
          Do not ask for 30 days.
        </label>
      )}
      {isPrimaryButtonDeleteState && (
        <div className="scanning-text">{translateThis('scanning_for_key')}</div>
      )}
      {loginFailedMessage.length > 0 && (
        <div className="error_text">
          <div>
            <TriangleWarning svgColorName="#CE021B" width={32} height={32} />
          </div>
          {loginFailedMessage}
        </div>
      )}
      {!isPrimaryButtonDeleteState && (
        <button className="button primary" onClick={onPrimaryButtonClicked}>
          {isPrimaryButtonContent ? translateThis('try_again') : locale.translateThis('Login')}
        </button>
      )}
      {isUseBackupButton && !isBackupButtonDeleteState && (
        <button
          className="backup"
          onClick={() => {
            onUseBackupButtonClicked()
            setIsPrimaryButtonDeleteState(false)
            setIsShowWebAuthnState(false)
            setIsBackupButtonDeleteState(true)
          }}
        >
          {translateThis('use_another_method')}
        </button>
      )}
    </div>
  ) : (
    <></>
  )
}
