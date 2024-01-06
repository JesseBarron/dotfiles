import React from 'react'
import type {LoggerWhichMessage} from '../../../javascript/bg/src/messaging/devlogs/devlogs'

type DynamicGenerateFilterToggleType = {
  toggleCheckbox: (name: keyof LoggerWhichMessage) => void
  filter: LoggerWhichMessage
}

export type StaticGenerateFilterToggleTypeMap = {
  [key: string]: StaticGenerateFilterToggleType
}

export type StaticGenerateFilterToggleType = {
  filterName: string
  title: string
  id: string
  htmlFor: string
  toggleName: keyof LoggerWhichMessage
}

export function generateFilterToggle(
  data: StaticGenerateFilterToggleType & DynamicGenerateFilterToggleType
) {
  const {filterName, title, id, htmlFor, toggleName, toggleCheckbox, filter} = data
  return (
    <div className="filter-checkbox">
      <span>{title}</span>
      {/*@ts-ignore proper keys*/}
      <div className={filter[filterName] ? 'md-toggle-checked' : 'md-toggle'}>
        {/* @ts-ignore proper keys*/}
        <input defaultChecked={filter[filterName]} readOnly type="checkbox" id={id} />
        <label
          onClick={() => {
            toggleCheckbox(toggleName)
          }}
          htmlFor={htmlFor}
        ></label>
      </div>
    </div>
  )
}
