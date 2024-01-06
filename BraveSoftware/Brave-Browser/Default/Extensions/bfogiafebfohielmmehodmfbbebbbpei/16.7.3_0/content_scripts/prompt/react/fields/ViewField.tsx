import classNames from 'classnames'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import {makeVoiceOverAlert} from '../../../../shared/a11y/makeVoiceOverAlert'
import locale, {translateThis} from '../../../../shared/locale'
import SvgMaker from '../../../../shared/svgMaker'
import {KeeperExtensionElement} from '../../inner/class-functions/containers'
import {VisibilityToggle} from '../../../../shared/svgMaker/visibilityToggle'
import {keyIsEnter} from '../../../../shared/a11y'
import {CsProvider} from '@content_scripts/prompt/redux/helpers/CsProvider'

interface Props {
  doFill: () => void
  label: string
  value: string
  isWebsiteLink?: boolean
  useMask?: boolean
  recordIsV2?: boolean
  maskType?: 'cvv' | 'card'
  ariaLabel?: string
}

const makeFieldMask = (value: string, maskType?: 'cvv' | 'card') => {
  let mask = ''
  switch (maskType) {
    case 'cvv':
      mask = '•••'
      break
    case 'card':
      mask = '••••' + (value || '').slice(-4)
      break
    default:
      break
  }

  return mask
}

// ViewField: a basic text field with fill button. website link optional
const ViewField: React.FC<Props> = (props) => {
  const {label, doFill, value, isWebsiteLink, useMask, maskType, ariaLabel} = props
  const isRTL = locale.useRTL()

  const fieldClasses = classNames('justify-between', 'value', 'align-center', {
    'themed-text': isWebsiteLink,
  })

  const labelClassNames = classNames('label', {[`${maskType}`]: !!maskType})

  const [isMasked, setIsMasked] = useState(true) //always start masked
  const [isVisibilityClicking, setIsVisibilityClicking] = useState(false)
  const [isVisibilityFocused, setIsVisibilityFocused] = useState(false)

  let currentVisibilityElement: HTMLElement | undefined

  if (!isVisibilityClicking && isVisibilityFocused) {
    currentVisibilityElement = document.activeElement?.children[0] as HTMLElement
  }

  return (
    <div className="field">
      <div style={{width: '100%', marginTop: isWebsiteLink && props.recordIsV2 ? 16 : ''}}>
        <div className={labelClassNames}>{label}</div>
        <div
          className={fieldClasses}
          title={value}
          role={isWebsiteLink ? 'link' : 'presentation'}
          aria-label={isWebsiteLink ? 'Website Address' : ariaLabel}
        >
          {useMask && isMasked ? makeFieldMask(value, maskType) : value}

          <div className="row align-center">
            {Boolean(useMask) && (
              <div
                className={`texttoggle tooltip-left tooltip-top ${isRTL ? 'ml-4' : 'mr-4'}`}
                tooltip={translateThis('Show')}
                aria-label={translateThis('Show')}
                style={{
                  width: 24,
                  height: 24,
                  bottom: 2,
                  right: 6,
                  cursor: 'pointer',
                }}
                tabIndex={0}
                onClick={() => {
                  setIsMasked(!isMasked)
                }}
                onKeyDown={(e) => {
                  if (keyIsEnter(e.code)) {
                    setIsMasked(!isMasked)
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
              >
                <CsProvider>
                  <VisibilityToggle
                    divClass="texttoggle"
                    masked={isMasked}
                    originalElement={currentVisibilityElement}
                  />
                </CsProvider>
              </div>
            )}

            <SvgMaker
              onClick={() => {
                makeVoiceOverAlert('Contents Filled')
                doFill()
              }}
              svgName={'fill'}
              keeper-tooltip={translateThis('Fill')}
              style={{
                width: 20,
                height: 20,
                // marginTop: 6,
                cursor: 'pointer',
              }}
              svgColorName={'#000'}
              tabIndex={0}
              screenReaderText={`Fill ${label}. Press enter to fill contents of the field into the webpage`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewField

// shortcut for creating a dom component to mount to
interface FieldProps {
  dataType: string
  value: string
  label: string
  domTarget: HTMLElement
  overlay: KeeperExtensionElement
  isWebsiteLink?: boolean
  useMask?: boolean
  ariaLabel?: string
  recordIsV2?: boolean
  maskType?: 'cvv' | 'card'
}

export const mountField = (field: FieldProps) => {
  const {
    dataType,
    value,
    label,
    domTarget,
    overlay,
    maskType,
    recordIsV2,
    isWebsiteLink,
    useMask,
    ariaLabel,
  } = field

  if (!value?.trim().length) return
  const container = document.createElement('div')

  ReactDOM.render(
    <ViewField
      doFill={() => overlay.fillField(dataType, value)}
      label={label}
      isWebsiteLink={Boolean(isWebsiteLink)}
      value={value}
      useMask={useMask}
      maskType={maskType}
      recordIsV2={recordIsV2}
      ariaLabel={ariaLabel}
    />,
    container
  )

  domTarget.appendChild(container)
}
