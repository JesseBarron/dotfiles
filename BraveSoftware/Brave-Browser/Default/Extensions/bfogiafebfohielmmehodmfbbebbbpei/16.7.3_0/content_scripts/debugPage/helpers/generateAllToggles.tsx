import {toggles} from '../data/toggleData'
import {DebugProps} from '../DebugPage'
import {generateToggle} from './generateToggle'

export function generateAllToggles(props: DebugProps) {
  return Object.keys(toggles).map((key) => {
    const value = toggles[key]

    const {title, id, htmlFor, fctName, optionName} = value

    return generateToggle({
      title,
      id,
      htmlFor,
      // @ts-ignore proper keys
      reduxOptionEnabled: props.debugOptions[optionName],
      // @ts-ignore proper keys
      setReduxFct: props[fctName],
    })
  })
}
