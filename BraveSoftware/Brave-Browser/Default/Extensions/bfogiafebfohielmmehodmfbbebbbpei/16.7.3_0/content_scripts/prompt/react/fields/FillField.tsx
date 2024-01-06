import classNames from 'classnames'
import React from 'react'
import ReactDOM from 'react-dom'
import SvgMaker from '../../../../shared/svgMaker'
import {KeeperExtensionElement} from '../../inner/class-functions/containers'

interface Props {
  onClick: () => void
  label: string
  value: string
  isWebsiteLink?: boolean
}

// FillField: a basic text field with fill button. website link optional
const FillField: React.FC<Props> = (props) => {
  const fieldClasses = classNames('justify-between', 'value', {
    'themed-text': props.isWebsiteLink,
  })

  return (
    <div className="field">
      <div style={{width: '100%'}}>
        <div className="label">{props.label}</div>
        <div className={fieldClasses} title={props.value}>
          {props.value}

          <SvgMaker
            onClick={props.onClick}
            svgName={'fill'}
            keeper-tooltip="Fill"
            style={{
              width: 20,
              height: 20,
              // marginTop: 6,
              cursor: 'pointer',
            }}
            svgColorName={'#000'}
          />
        </div>
      </div>
    </div>
  )
}

export default FillField

// shortcut for creating a dom component to mount to
interface FieldProps {
  dataType: string
  value: string
  label: string
  domTarget: HTMLElement
  overlay: KeeperExtensionElement
  isWebsiteLink?: boolean
}

export const mountField = (field: FieldProps) => {
  const {dataType, value, label, domTarget, overlay, isWebsiteLink} = field
  const container = document.createElement('div')

  ReactDOM.render(
    <FillField
      onClick={() => {
        overlay.fillField(dataType, value)
      }}
      label={label}
      isWebsiteLink={Boolean(isWebsiteLink)}
      value={value}
    />,
    container
  )

  domTarget.appendChild(container)
}
