import React, {useState} from 'react'
import locale, {translateThis} from '../../../../shared/locale'
import {checkKeeperPassword} from '../../../../shared/Misc/password_functions'
import {getTheme} from '../../../../shared/Redux/selectors'

import Fill from '../../../../shared/svgMaker/fill'
import iframeUtil from '../../iframeUtil'
import {KeeperExtensionElement} from '../../inner/class-functions/containers'
import {checkMPReentry} from '../../inner/inits/records'
import store from '../../../../shared/Redux/storeProxy'
import InfoI from '../../../../shared/svgMaker/infoI'
import {VisibilityToggle} from '../../../../shared/svgMaker/visibilityToggle'
import {keyIsEnter} from '../../../../shared/a11y'
import {CsProvider} from '@content_scripts/prompt/redux/helpers/CsProvider'

interface Props {
  value: string
  restricted?: boolean
  privacyScreenEnforced?: boolean
  otherFieldValues?: string[]
  styles?: React.CSSProperties
  label?: string
}

export const PasswordField: React.FC<Props> = (props) => {
  const [masked, setMasked] = useState(true)
  const [percentage, _setPercentage] = useState(
    checkKeeperPassword(props.value, props.otherFieldValues).score.percentage
  )
  const [isVisibilityClicking, setIsVisibilityClicking] = useState(false)
  const [isVisibilityFocused, setIsVisibilityFocused] = useState(false)

  let currentVisibilityElement: HTMLElement | undefined
  const isRTL = locale.useRTL()

  if (!isVisibilityClicking && isVisibilityFocused) {
    currentVisibilityElement = document.activeElement?.children[0] as HTMLElement
  }
  const doFill = () => {
    checkMPReentry(showAction)

    function showAction(): void {
      if (!props.restricted) {
        ;(iframeUtil.getOverlay() as KeeperExtensionElement).fillField('secret2', props.value)
      }
    }
  }

  // Toggle the visibility (masked/unmasked) of the TOTP field.  May
  // require MP re-entry.
  const doToggle = () => {
    if (!masked) {
      showAction()
      return
    }

    checkMPReentry(() => {
      if (props.privacyScreenEnforced === false) {
        showAction()
      }
    })

    function showAction(): void {
      // This calls the setUnmasked setter, which shows the plain-text or
      // redacted TOTP based on the eyeball state.
      setMasked(!masked)
    }
  }

  const getPowerStyles = () => {
    const mode = getTheme(store.getState()).mode

    // const percentage = Math.min(Math.max(strScore, 19), 100)
    let backgroundColor = ''

    if (mode == 'dark') {
      if (percentage < 20) {
        backgroundColor = '#FF7361'
      } else if (percentage < 40) {
        backgroundColor = '#FF762B'
      } else if (percentage < 60) {
        backgroundColor = '#FFC700'
      } else if (percentage < 80) {
        backgroundColor = '#64DC16'
      } else {
        backgroundColor = '#64DC16'
      }
    } else {
      if (percentage < 20) {
        backgroundColor = '#B60000'
      } else if (percentage < 40) {
        backgroundColor = '#9D3800'
      } else if (percentage < 60) {
        backgroundColor = '#FFC700'
      } else if (percentage < 80) {
        backgroundColor = '#1A9732'
      } else {
        backgroundColor = '#1A9732'
      }
    }

    return {width: `${percentage}%`, backgroundColor}
  }

  const getStrengthTitle = () => {
    if (percentage < 20) {
      return 'Very Weak'
    } else if (percentage < 40) {
      return 'Weak'
    } else if (percentage < 60) {
      return 'Good'
    } else if (percentage < 80) {
      return 'Strong'
    } else {
      return 'Very Strong'
    }
  }

  return (
    <div className="keeper-record-field-password" style={props.styles}>
      <div style={{position: 'relative'}}>
        <div className="keeper-record-label" title={props.label ?? translateThis('secret2_header')}>
          {props.label ?? translateThis('secret2_header')}
        </div>
        <div className="keeper-record-field">
          <div className="keeper-password">
            <div
              className="keeper-input"
              aria-label="Generated Password Read Only Field"
              style={{textAlign: isRTL ? 'right' : 'left'}}
            >
              {masked ? '••••••••••' : props.value}
            </div>

            {!props.privacyScreenEnforced && !props.restricted && (
              <div
                className="keeper-iconbutton-eyeball focus-visible"
                tabIndex={0}
                aria-roledescription="button"
                title={masked ? translateThis('Show', 'Show') : translateThis('Hide', 'Hide')}
                onClick={doToggle}
                onKeyDown={(e) => {
                  if (keyIsEnter(e.code)) {
                    doToggle()
                  }
                  setIsVisibilityClicking(false)
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  setIsVisibilityClicking(true)
                }}
                onFocus={() => {
                  setIsVisibilityFocused(true)
                }}
                onBlur={() => {
                  setIsVisibilityFocused(false)
                }}
                style={{cursor: 'pointer', height: 24, width: 24, position: 'relative'}}
              >
                <CsProvider>
                  <VisibilityToggle
                    divClass="keeper-iconbutton-eyeball"
                    masked={masked}
                    originalElement={currentVisibilityElement}
                  />
                </CsProvider>
              </div>
            )}

            <div
              keeper-tooltip={translateThis('Fill')}
              onClick={doFill}
              className={`keeper-iconbutton-fill ${props.restricted ? 'force-right' : ''}`}
              style={{cursor: 'pointer', position: 'relative'}}
            >
              <Fill width={24} />
            </div>

            {props.privacyScreenEnforced ? (
              <div className="keeper-password-privacy-screen">
                <InfoI width={20} />
                <p>
                  {translateThis(
                    'privacy_screen_is_enabled_by_admin',
                    'Privacy Screen is enabled by the admin'
                  )}
                </p>
              </div>
            ) : (
              !props.restricted && (
                <div
                  className="keeper-password-strength"
                  aria-label="Passowrd Strength Meter."
                  title={getStrengthTitle()}
                >
                  <div style={getPowerStyles()}></div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
