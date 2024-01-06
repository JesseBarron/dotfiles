import React, {useCallback, useEffect, useState} from 'react'
import {generateTotpToken} from '../../../../javascript/bg/src/auth/totp_functions'
import {formatTotpToken} from '@shared/Records/record-types-utils'
import {translateThis} from '../../../../shared/locale'
import Fill from '../../../../shared/svgMaker/fill'
import Visibility from '../../../../shared/svgMaker/visibility'
import {generateTotpParams, TotpURIParams} from '../../../../shared/totp'
import iframeUtil from '../../iframeUtil'
import {KeeperExtensionElement} from '../../inner/class-functions/containers'
import {checkMPReentry} from '../../inner/inits/records'
import ReactDOM from 'react-dom'

interface Props {
  totpURI: string
  showToggle: boolean
  label: string
}

export const TotpField: React.FC<Props> = (props) => {
  const [masked, setMasked] = useState(true)

  const [renderRadius, setRenderRadius] = useState(0)
  const [renderCircumference, setRenderCircumference] = useState(0)

  const [dashOffSet, setDashOffSet] = useState(0)
  const [timerDuration, setTimerDuration] = useState(0)

  const [token, setToken] = useState('')

  const [intervalTimerId, setIntervalTimerId] = useState(0)
  const [viewBoxDimensions, setViewBoxDimensions] = useState('0 0 30 30')
  const [translate, setTranslate] = useState('')

  const totpParams = generateTotpParams(props.totpURI) as TotpURIParams

  useEffect(() => {
    if (!props.totpURI) return

    const radius = 15
    const strokeWidth = 4
    const diameter = 2 * radius
    setViewBoxDimensions(`0 0 ${diameter} ${diameter}`)
    setTranslate(`translate(${radius}, ${radius})`)
    const renderRadius = radius - strokeWidth / 2

    const renderCic = Math.PI * 2 * renderRadius
    setRenderCircumference(renderCic)
    setRenderRadius(renderRadius)

    // Initial offset to match search/Vault
    let offSet = Math.floor(Date.now() / 1000)

    const counter = Math.floor(offSet / totpParams.period)
    const nextCounter = (counter + 1) * totpParams.period

    let remaining = nextCounter - offSet

    update(remaining, Math.PI * 2 * renderRadius, totpParams.period)

    setTimerDuration(totpParams.period)

    const totpToken = generateTotpToken(totpParams)
    if (typeof totpToken === 'string') {
      setToken(totpToken)
    }

    setIntervalTimerId(
      window.setInterval(() => {
        remaining--
        if (remaining <= 0) {
          const token = generateTotpToken(totpParams)
          setToken(token)
          remaining = totpParams.period
        }
        update(remaining, Math.PI * 2 * renderRadius, totpParams.period)
      }, 1000)
    )

    return () => {
      window.clearInterval(intervalTimerId)
    }
  }, [props.totpURI])

  // Toggle the visibility (masked/unmasked) of the TOTP field.  May
  // require MP re-entry.
  function doToggle(): void {
    // e.stopPropagation()

    if (props.showToggle) {
      action()
      return
    }

    checkMPReentry(action)

    function action(): void {
      // elem.refs.eyeball.mode = elem.refs.eyeball.mode === 'hidden' ? 'visible' : 'hidden'

      // This calls the setUnmasked setter, which shows the plain-text or
      // redacted TOTP based on the eyeball state.
      setMasked(!masked)
    }
  }

  // Fill a field with the TOTP.  May require MP re-entry.
  function doFill(): void {
    // e.stopPropagation()
    checkMPReentry(action)

    function action(): void {
      const overlay = iframeUtil.getOverlay() as KeeperExtensionElement

      overlay.fillField('totp', token)
    }
  }

  const totpDisplayVal = () =>
    masked ? token.replace(' ', '').replace(/./g, '•') : formatTotpToken(token)

  const update = (remaining: number, circumference: number, duration: number) => {
    const newOffset = circumference + (circumference * remaining) / duration
    if (isNaN(newOffset)) {
      setDashOffSet(0)
      return
    }
    setDashOffSet(newOffset)
  }

  return (
    <div
      className="keeper-record-field-totp"
      aria-label="Two Factor Code Read Only Field. The automatically generated two factor code will be generated here"
    >
      <svg
        viewBox={viewBoxDimensions}
        className="countdown-circle"
        height="30px"
        width="30px"
        style={{flexShrink: 0, padding: '3px 10px 0px 0px'}}
      >
        <g transform={translate}>
          <circle className="base" r={renderRadius}></circle>
          <circle
            className="progress"
            r={renderRadius}
            transform="rotate(-90)"
            style={{strokeDashoffset: dashOffSet, strokeDasharray: renderCircumference}}
          ></circle>
        </g>
      </svg>

      <div style={{position: 'relative', justifyContent: 'center'}}>
        <div className="keeper-record-label" title={props.label}>
          {props.label}
        </div>
        <div className="keeper-record-field" title={totpDisplayVal()}>
          {totpDisplayVal()}
        </div>
      </div>

      <div
        className={`keeper-iconbutton-eyeball focus-visible ${props.showToggle ? '' : 'hidden'}`}
        tabIndex={0}
        aria-label="TOTP view"
        aria-roledescription="button"
        title={props.showToggle ? translateThis('Show', 'Show') : translateThis('Hide', 'Hide')}
        onClick={doToggle}
        onMouseDown={(e) => e.preventDefault()}
        style={{cursor: 'pointer', height: 24, width: 24, position: 'relative'}}
      >
        <Visibility />
      </div>

      <div
        keeper-tooltip="Fill"
        onClick={doFill}
        className="keeper-iconbutton-fill"
        style={{cursor: 'pointer', position: 'relative'}}
      >
        <Fill width={24} />
      </div>
    </div>
  )
}

export const renderTOTP = (root: HTMLElement, props: Props) => {
  ReactDOM.render(<TotpField {...props} />, root)
}
