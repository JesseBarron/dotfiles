import React, {useState} from 'react'
import {translateThis} from '../../../../shared/locale'

import Fill from '../../../../shared/svgMaker/fill'
import Visibility from '../../../../shared/svgMaker/visibility'
import iframeUtil from '../../iframeUtil'
import {KeeperExtensionElement} from '../../inner/class-functions/containers'
import {checkMPReentry} from '../../inner/inits/records'
import {keyIsEnter} from '@shared/a11y'
import VisibilityOff from '@shared/svgMaker/visibilityOff'

interface Props {
  value: string
  dataKey?: string
  label: string
  restricted?: boolean
  showToggle?: boolean
  hideFillButton?: boolean
  privacyScreenEnforced?: boolean
  styles?: React.CSSProperties
  ariaLabel?: string
}

// BasicField: a basic text field with fill button. website link optional
export const ExtraField: React.FC<Props> = (props) => {
  const [masked, setMasked] = useState(props.showToggle)

  const doFill = () => {
    checkMPReentry(action)

    function action(): void {
      if (!props.restricted && props.dataKey) {
        ;(iframeUtil.getOverlay() as KeeperExtensionElement).fillField(props.dataKey, props.value)
      }
    }
  }

  // Toggle the visibility (masked/unmasked) of the TOTP field.  May
  // require MP re-entry.
  const doToggle = () => {
    if (!props.privacyScreenEnforced) {
      action()
      return
    }

    checkMPReentry(action)

    function action(): void {
      // This calls the setUnmasked setter, which shows the plain-text or
      // redacted TOTP based on the eyeball state.
      setMasked(!masked)
    }
  }

  return (
    <div className="keeper-record-field-extra">
      <div style={{position: 'relative'}}>
        <div className="keeper-record-label" title={props.label}>
          {props.label}
        </div>
        <div className="keeper-record-field">
          {masked || props.privacyScreenEnforced
            ? props.value.replace(/./g, '•') || ''
            : props.value}
        </div>
      </div>

      <div className="icons">
        {props.showToggle && !props.privacyScreenEnforced && (
          <div
            className="keeper-iconbutton-eyeball focus-visible"
            tabIndex={0}
            aria-roledescription="button"
            title={props.ariaLabel ?? 'View Extra'}
            onClick={doToggle}
            onMouseDown={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (keyIsEnter(e.key)) {
                doToggle()
              }
            }}
            style={{cursor: 'pointer', height: 24, width: 24, position: 'relative'}}
          >
            {masked ? <Visibility /> : <VisibilityOff />}
          </div>
        )}
        {!props.hideFillButton && (
          <div
            keeper-tooltip={translateThis('Fill')}
            onClick={doFill}
            className={`keeper-iconbutton-fill ${props.restricted ? 'force-right' : ''}`}
            style={{cursor: 'pointer', position: 'relative'}}
          >
            <Fill width={24} />
          </div>
        )}
      </div>
    </div>
  )
}
