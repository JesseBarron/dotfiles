import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ListChildComponentProps, VariableSizeList as List} from 'react-window'
import {JSONTree} from 'react-json-tree'

import type {DevLog, DevLogWithID} from '../../javascript/bg/src/redux/cfg/cfgInitialState'
import {RowMeasurer, MeasuredRow} from '../../shared/Lists/RowMeasurer'
import ChevronDown from '../../shared/svgMaker/chevronDown'
import ChevronRight from '../../shared/svgMaker/chevronRight'

const DEFAULT_ROW_HEIGHT = 150

// https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes
const theme = {
  base00: '#002b36',
  base01: '#073642',
  base02: '#586e75',
  base03: '#657b83',
  base04: '#839496',
  base05: '#93a1a1',
  base06: '#eee8d5',
  base07: '#fdf6e3',
  base08: '#dc322f',
  base09: '#cb4b16',
  base0A: '#b58900',
  base0B: '#859900',
  base0C: '#2aa198',
  base0D: '#268bd2',
  base0E: '#6c71c4',
  base0F: '#d33682',
}

export const DebugLog = (props: {logs: DevLogWithID[]}) => {
  const ListRef = useRef<List>(null)

  const measurer = useRef(new RowMeasurer())

  useEffect(() => {
    measurer.current.onResized((idxs) => {
      const index = idxs[0]
      if (index >= 0) {
        ListRef.current?.resetAfterIndex(index)
      }
    })
  }, [props.logs])

  const getKey = useCallback(
    (index: number) => {
      return props.logs[index].uid
    },
    [props.logs]
  )

  const getItemSize = useCallback(
    (index: number) => {
      const key = getKey(index)
      const size = measurer.current.getSize(key) ?? DEFAULT_ROW_HEIGHT
      return size
    },
    [props.logs]
  )

  const rowRenderer = useCallback(
    ({index, style}: ListChildComponentProps) => {
      const logItem = props.logs[index]
      const key = getKey(index)

      return (
        <MeasuredRow measurer={measurer.current}>
          {({childRef}) => (
            <div key={key} style={style} data-index={index}>
              <LogItem ref={childRef} logItem={logItem} />
            </div>
          )}
        </MeasuredRow>
      )
    },
    [props.logs]
  )

  return (
    <div className="log-container">
      <List
        style={{marginTop: 8}}
        width={1000}
        height={700}
        ref={ListRef}
        itemCount={props.logs.length}
        itemSize={getItemSize}
        estimatedItemSize={DEFAULT_ROW_HEIGHT}
        overscanCount={10}
      >
        {rowRenderer}
      </List>
    </div>
  )
}

type LogItemProps = {
  logItem: DevLogWithID
}

const LogItem = React.forwardRef<HTMLDivElement, LogItemProps>(({logItem}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = setIsExpanded.bind(null, !isExpanded)

  return (
    <div ref={ref} id={logItem.uid} className={`log-item ${logItem.isError ? 'error-log' : ''}`}>
      <div className="toggle" onClick={toggleExpand}>
        {isExpanded ? (
          <ChevronDown width={20} height={20} />
        ) : (
          <ChevronRight width={20} height={20} />
        )}
        <div className="group">
          {logItem.group} <div style={{fontSize: 12}}>{logItem.loggedMethod}</div>
        </div>
      </div>

      {isExpanded && (
        <div>
          {logItem.message && <div className={`log-message`}>{logItem.message}</div>}

          {logItem.tabId && <div className="tabId">TAB ID: {logItem.tabId}</div>}
          <pre className="whichMessage">{JSON.stringify(logItem.whichMessages, null, 4)}</pre>

          <div>
            <JSONTree data={logItem.data} theme={theme} invertTheme={false} />
          </div>
          <div className="timestamp">{new Date(logItem.timestamp).toString()}</div>
        </div>
      )}
    </div>
  )
})
