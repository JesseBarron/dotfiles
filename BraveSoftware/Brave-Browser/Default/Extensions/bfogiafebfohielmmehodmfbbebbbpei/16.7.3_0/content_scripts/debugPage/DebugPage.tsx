import _, {pick, pickBy} from 'lodash'
import React, {useCallback, useEffect, useState} from 'react'
import {connect, MapDispatchToProps, MapStateToProps} from 'react-redux'
import {LoggerWhichMessage} from '../../javascript/bg/src/messaging/devlogs/devlogs'

import type {DebugOptionsCFG, DevLogWithID} from '../../javascript/bg/src/redux/cfg/cfgInitialState'
import type {Store} from '../../javascript/bg/src/redux/rootReducer'
import {sharedAliases} from '../../shared/Redux/aliases'
import {getCfg, getDebugOptions, getDevlogs} from '../../shared/Redux/selectors'
import ChevronDown from '../../shared/svgMaker/chevronDown'
import ChevronRight from '../../shared/svgMaker/chevronRight'
import {generateAllToggles} from './helpers/generateAllToggles'
import {generateAllFilterToggles} from './helpers/generateAllFilterToggles'

import {DebugLog} from './DebugLogs'
import {useLog} from './hooks/useLog'

type DispatchProps = {
  setDebugMode: (val: boolean) => void
  setDebugContentScriptsMessages: (val: boolean) => void
  setFunctions: (val: boolean) => void
  setDebugAPIMessages: (val: boolean) => void
  setDebugVault: (val: boolean) => void
  setDebugBAMEssages: (val: boolean) => void
  setDebugTimer: (val: boolean) => void
  setDebugRedux: (val: boolean) => void
  setDebugContextMenu: (val: boolean) => void
  setDebugBgMessages: (val: boolean) => void
  setDevlogsMaxCount: (val: number) => void
  setDebugDetectionTestMessages: (val: boolean) => void
  clearDevlogs: () => void
}
type OwnProps = {}
type StateProps = {
  debugOptions: DebugOptionsCFG
}

export type DebugProps = StateProps & OwnProps & DispatchProps

const DebugPage = (props: DebugProps) => {
  const [filters, setFilters] = useState<LoggerWhichMessage>({
    functions: true,
    csMessages: true,
    baMessages: true,
    apiMessages: true,
    vaultMessages: true,
    contextMenuMessages: true,
    timerMessages: true,
    reduxMessages: true,
    backgroundMessages: true,
    detectionTestMessages: true,
  })
  const [filteredLogs, setFilteredLogs] = useState<DevLogWithID[]>([])
  const [showOptions, setShowOptions] = useState(true)
  const [showFilters, setShowFilters] = useState(true)

  const toggleCheckbox = useCallback(
    (val: keyof LoggerWhichMessage) => {
      setFilters({
        ...filters,
        [val]: !filters[val],
      })
    },
    [filters]
  )

  const devLogs = useLog()

  useEffect(() => {
    const newLogs = devLogs.filter((currentLog) => {
      try {
        const tags = Object.keys(currentLog.whichMessages ?? {})
        if (!tags.length) {
          // in case which message left empty
          return true
        }
        const sharedPickObj = pick(filters, tags)
        const truthyShared = Object.keys(pickBy(sharedPickObj, Boolean))
        const hasSharedKeys = truthyShared.length > 0
        return hasSharedKeys
      } catch (e) {
        console.error(e)
      }
    })

    setFilteredLogs(newLogs)
  }, [devLogs, filters])

  return (
    <div id="debug-app">
      <div className="row">
        <section
          id="info"
          className="row align-center"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ChevronDown width={20} height={20} />
          ) : (
            <ChevronRight width={20} height={20} />
          )}
          <p>Show Debug Options</p>
        </section>

        <section id="debug-options" style={{display: showOptions ? '' : 'none'}}>
          {generateAllToggles(props)}
        </section>
      </div>

      <div
        className="row align-center"
        style={{cursor: 'pointer'}}
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? (
          <ChevronDown width={20} height={20} />
        ) : (
          <ChevronRight width={20} height={20} />
        )}
        <p>Show Filters</p>
      </div>

      <div style={{display: showFilters ? 'flex' : 'none'}}>
        <div id="log-controls">
          <button
            onClick={() => {
              props.clearDevlogs()
            }}
          >
            Clear Logs
          </button>

          <div>
            <div>Remove Old Logs After How Many?</div>
            <select
              value={props.debugOptions.devlogsMaxCount}
              onChange={(e) => {
                props.setDevlogsMaxCount(parseInt(e.target.value))
              }}
            >
              <option value={20}>20</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>
        </div>

        <div className="column">
          <p>Filter Logged Events by Type</p>
          <div id="filters">{generateAllFilterToggles(filters, toggleCheckbox)}</div>
        </div>
      </div>

      <section id="debug-logs">
        <DebugLog logs={filteredLogs} />
      </section>
    </div>
  )
}

const mapStateToProps: MapStateToProps<StateProps, {}, Store> = (state) => {
  if (Object.entries(state).length == 0)
    return {
      debugOptions: {
        DebugMode: false,
        dFunctions: false,
        dCSMessages: false,
        dAPIMessages: false,
        dBGMessages: false,
        dVaultMessages: false,
        dBAMessages: false,
        dTimer: false,
        dContextMenuMessages: false,
        dRedux: false,
        dDetectionTestMessages: false,
        devlogsMaxCount: 20,
      },
    }

  return {
    debugOptions: getDebugOptions(state),
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch) => {
  return {
    setDebugMode: (val: boolean) => dispatch(sharedAliases.setDebugMode(val)),
    setDebugContentScriptsMessages: (val: boolean) =>
      dispatch(sharedAliases.setDebugContentScriptsMessages(val)),
    setFunctions: (val: boolean) => dispatch(sharedAliases.setDebugFunctions(val)),
    setDebugAPIMessages: (val: boolean) => dispatch(sharedAliases.setDebugAPIMessages(val)),
    setDebugVault: (val: boolean) => dispatch(sharedAliases.setDebugVault(val)),
    setDebugBAMEssages: (val: boolean) => dispatch(sharedAliases.setDebugBAMEssages(val)),
    setDebugTimer: (val: boolean) => dispatch(sharedAliases.setDebugTimer(val)),
    setDebugRedux: (val: boolean) => dispatch(sharedAliases.setDebugRedux(val)),
    setDebugContextMenu: (val: boolean) => dispatch(sharedAliases.setDebugContextMenu(val)),
    clearDevlogs: () => dispatch(sharedAliases.clearDevlogs()),
    setDevlogsMaxCount: (val: number) => dispatch(sharedAliases.setDevlogsMaxCount(val)),
    setDebugBgMessages: (val: boolean) => dispatch(sharedAliases.setDebugBgMessages(val)),
    setDebugDetectionTestMessages: (val: boolean) =>
      dispatch(sharedAliases.setDebugDetectionTest(val)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DebugPage)
