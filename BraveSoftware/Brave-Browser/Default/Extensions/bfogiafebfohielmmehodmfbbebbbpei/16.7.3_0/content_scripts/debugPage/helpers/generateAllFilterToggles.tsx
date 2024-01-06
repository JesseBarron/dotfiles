import {LoggerWhichMessage} from '../../../javascript/bg/src/messaging/devlogs/devlogs'
import {filterToggle} from '../data/filterData'
import {generateFilterToggle} from './generateFilterToggle'

export function generateAllFilterToggles(
  filters: LoggerWhichMessage,
  toggleCheckbox: (name: keyof LoggerWhichMessage) => void
) {
  return Object.keys(filterToggle).map((key) => {
    const value = filterToggle[key]
    const {title, id, htmlFor, filterName, toggleName} = value

    return generateFilterToggle({
      title,
      id,
      htmlFor,
      filterName,
      toggleName,
      toggleCheckbox,
      filter: filters,
    })
  })
}
