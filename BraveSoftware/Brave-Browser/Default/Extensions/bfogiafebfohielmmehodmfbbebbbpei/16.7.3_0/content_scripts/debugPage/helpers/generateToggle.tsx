import React from 'react'

export type StaticToggleGUIMap = {
  [key: string]: StaticToggleGUI
}

export type StaticToggleGUI = {
  title: string
  id: string
  htmlFor: string
  fctName: string
  optionName: string
}

export type DynamicToggleGUI = {
  reduxOptionEnabled: boolean
  setReduxFct: (option: boolean) => void
}

export function generateToggle(
  guiOptions: Omit<StaticToggleGUI, 'fctName' | 'optionName'> & DynamicToggleGUI
) {
  const {title, id, htmlFor, reduxOptionEnabled, setReduxFct} = guiOptions
  return (
    <div className="row">
      <span>{title}</span>
      <div className={reduxOptionEnabled ? 'md-toggle-checked' : 'md-toggle'}>
        <input defaultChecked={reduxOptionEnabled} readOnly type="checkbox" id={id} />
        <label
          onClick={() => {
            setReduxFct(!reduxOptionEnabled)
          }}
          htmlFor={htmlFor}
        ></label>
      </div>
    </div>
  )
}
