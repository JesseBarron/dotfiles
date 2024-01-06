import {debounce} from 'lodash'
import React, {CSSProperties, useCallback, useEffect, useState} from 'react'

import {MessagePrefixes} from '../../../../javascript/bg/src/messaging/enums'
import {GetMessageHandlerNames} from '../../../../javascript/bg/src/messaging/getMessageHandler/enums'
import {SetMessageHandlerNames} from '../../../../javascript/bg/src/messaging/setMessageHandler/enums'
import {Address} from '../../../../javascript/bg/src/types/cache/address'
import {isRecordV3, RecordV3} from '../../../../javascript/bg/src/types/cache/record'
import {
  extractLoginField,
  extractPaymentCardField,
  getAddressValues,
  maskCCN,
} from '@shared/Records/record-types-utils'
import {keyIsEnter} from '../../../../shared/a11y'
import {makeVoiceOverAlert} from '../../../../shared/a11y/makeVoiceOverAlert'
import {translateThis} from '../../../../shared/locale'
import {CSSearchInput} from '../../../../shared/Search/SearchInput'
import {CheckSvg} from '../../../../shared/svg/CheckSvg'
import Add from '../../../../shared/svgMaker/add'
import DropDownArrow from '../../../../shared/svgMaker/dropDownArrow'
import Location from '../../../../shared/svgMaker/location'
import messaging from '../../../lib/messaging'
import iframeUtil from '../../iframeUtil'
import {KeeperListItemType} from '../../inner/class-functions/selects'
import {promptAliases} from '../../redux/aliases'
import {constants} from '../../../contentScriptsConstants'
import CardIcon from '../../../../shared/record_views/CardIcon'
import {getRecordListOpen, getThisTabInfo} from '../../redux/getThisTabState'
import {csDispatch} from '../../../csStoreProxy'
import {csProxyStoreContext, useCsStoreSelector} from '../../redux/csProxyStoreContext'
import RecordGlobe from '../../../../shared/svgMaker/recordGlobe'
import {getFaviconUrl} from '@content_scripts/misc_functions/urlHelpers/getFaviconUrl'

import {connect, MapStateToProps} from 'react-redux'
import {CsStore} from 'custom/javascript/bg/src/redux-cs/rootReducer'

interface StateProps {
  searchValue: string
}

interface RecordFieldProps {
  selectedRecord: KeeperListItemType
  records?: KeeperListItemType[]
  count?: number
  iconUrl?: string

  referrer?: string

  showToggle?: boolean
  showFillButton?: boolean
  initializedSearchValue?: string

  displayMode: 'login' | 'card' | 'address'
  isPasswordChangeMode?: boolean

  createNew: () => void
  selectRecord: (selectedItem: KeeperListItemType) => void
}

type CSRecordFieldProps = RecordFieldProps & StateProps

const RecordFieldSelectorComponent: React.FC<CSRecordFieldProps> = (props) => {
  const [searchResults, setSearchResults] = useState<KeeperListItemType[]>(props.records ?? [])
  const [faviconError, setFaviconError] = useState<boolean>(false)
  const [faviconUrl, setFaviconUrl] = useState<string>()
  const useFaviconUrl = async () => {
    const url = await getFaviconUrl()
    setFaviconUrl(url ?? '')
  }
  const recordListOpen = useCsStoreSelector(getRecordListOpen)
  const tabId = useCsStoreSelector(getThisTabInfo).id

  useEffect(() => {
    if (props.iconUrl) {
      return
    }
    useFaviconUrl()
  }, [])

  useEffect(() => {
    if (!props.iconUrl) {
      return
    }
    setFaviconUrl(props.iconUrl)
  }, [props.iconUrl])

  const {isPasswordChangeMode} = props

  const listRef = React.useRef<HTMLDivElement>(null)

  const getSearchResults = (value: string) => {
    if (tabId !== constants.tabId) return
    messaging.sendMessage(
      GetMessageHandlerNames.GET_SEARCH_RESULTS,
      {type: MessagePrefixes.GET, data: {searchValue: value, source: props.records}},
      (result: KeeperListItemType[]) => {
        setSearchResults(result)
      }
    )
  }

  useEffect(() => {
    getSearchResults(props.searchValue)
  }, [props.searchValue])

  const promptWindowInputChanged = (value: string) => {
    return debounce(() => {
      getSearchResults(value)
    }, 300)()
  }
  const checkoutsideclick = useCallback(
    (e: MouseEvent) => {
      if (listRef.current?.contains(e.target as Node)) return

      csDispatch(promptAliases.setRecordListOpen(false))
    },
    [recordListOpen]
  )

  useEffect(() => {
    if (recordListOpen) {
      iframeUtil.updateFrameHeight(295)
    } else {
      iframeUtil.updateFrameHeight()
    }

    messaging.sendMessage(SetMessageHandlerNames.CLOSE_RECORD_LIST_EVENT_LISTENER, {
      type: MessagePrefixes.SET,
    })

    if (recordListOpen) {
      document.onclick = checkoutsideclick
    }

    return () => {
      document.onclick = null
    }
  }, [recordListOpen])

  const toggleList = () => {
    csDispatch(promptAliases.setRecordListOpen(!recordListOpen))

    if (Number(props.records?.length) > 1 && recordListOpen) {
      makeVoiceOverAlert('Search field is now available')
    }
  }
  const hasMultipleRecords = props.records && props.records.length > 1
  const borderStyles: CSSProperties =
    hasMultipleRecords && recordListOpen
      ? {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderColor: '#2981E8',
        }
      : {
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          borderColor: '#000',
        }
  const fieldStyles = {
    ...borderStyles,
    cursor: hasMultipleRecords ? 'cursor' : 'auto',
  }

  const getItemFieldVal = (item: KeeperListItemType) => {
    switch (props.displayMode) {
      case 'address':
        const {street_address} = getAddressValues(item as RecordV3 | Address)
        return street_address?.join(' ')?.trim() || '---'

        break
      case 'card':
        const value =
          (isRecordV3(item) ? extractPaymentCardField(item)?.value[0]?.cardNumber : item.ccn) ?? ''

        const itemCCN = value.length >= 4 ? maskCCN(value) : value

        return itemCCN || '---'

        break
      case 'login':
        const login = (isRecordV3(item) ? extractLoginField(item)?.value[0] : item?.secret1) ?? ''

        return login ?? '---'

        break
    }
  }
  const getItemIcon = (item: KeeperListItemType) => {
    switch (props.displayMode) {
      case 'address':
        return (
          <div
            className="themed-svg keeper-iconbutton-address"
            style={{cursor: 'pointer', position: 'relative'}}
          >
            <Location width={24} height={24} />
          </div>
        )
        break
      case 'card':
        const value: string =
          (isRecordV3(item) ? extractPaymentCardField(item)?.value[0]?.cardNumber : item.ccn) ?? ''

        const itemCCN = value.length >= 4 ? maskCCN(value) : value
        const ariaLabel = `Payment Card ending in ${(itemCCN || '').slice(-4)}`

        return <CardIcon cardNumber={value} ariaLabel={ariaLabel} />
        break
      case 'login':
        return (
          <div className="favicon-record-icon-for-keeper-list">
            {!faviconUrl?.length || faviconError ? (
              <RecordGlobe />
            ) : (
              <img
                width={24}
                height={24}
                src={faviconUrl}
                aria-label={`${props.referrer} icon`}
                onError={setFaviconError.bind(null, true)}
              />
            )}
          </div>
        )
        break
    }
  }

  const listResults = searchResults.map((item, i) => {
    const itemUid = item.record_uid ?? item.uid
    const selectedItemUid = props.selectedRecord?.record_uid ?? props.selectedRecord?.uid

    const isSelected = itemUid == selectedItemUid

    const value = getItemFieldVal(item)
    const selectedStyle = isPasswordChangeMode
      ? {
          marginTop: 0,
          top: '33%',
        }
      : undefined

    return (
      <div
        title={item.title}
        className="focus-visible keeper-listitem"
        role="option"
        tabIndex={0}
        key={i}
        aria-selected={isSelected}
        onClick={(e) => {
          props.selectRecord(item)
        }}
        onKeyDown={(e) => {
          if (keyIsEnter(e.key)) {
            props.selectRecord(item)
          }
        }}
        aria-label={`Login ${item.title}`}
      >
        <div className="title-for-keeper-list" aria-hidden="true">
          {item.title}
        </div>
        <div
          className={`username-for-keeper-list ${value ? 'username-wrap' : ''}`}
          aria-hidden="true"
        >
          {value}
        </div>

        {getItemIcon(item)}

        {isSelected && (
          <div id="done-container" style={selectedStyle}>
            <CheckSvg isContained={false} />
          </div>
        )}
      </div>
    )
  })

  let ariaFieldLabel = ''
  const fieldVal = getItemFieldVal(props.selectedRecord)
  const cardNumber: string =
    (isRecordV3(props.selectedRecord)
      ? extractPaymentCardField(props.selectedRecord)?.value[0]?.cardNumber
      : props.selectedRecord.ccn) ?? ''

  switch (props.displayMode) {
    case 'address':
      const {street_address} = getAddressValues(props.selectedRecord as RecordV3 | Address)
      ariaFieldLabel = `Address Selection ${
        street_address.join(' ')?.trim() || '---'
      } Dropdown List. A list of all addresses.`
      break
    case 'card':
      ariaFieldLabel = `Payment Selection. ${props.selectedRecord.title}. Drop Down List. A list of all payment cards`
      break
    case 'login':
      ariaFieldLabel = `Login Selection. ${fieldVal}. Drop Down List. Open this menu to go through all the available login options.`
      break
  }

  return (
    <div
      className={`keeper-record-field-${props.displayMode} focus-visible`}
      role="button"
      tabIndex={0}
      ref={listRef}
      aria-label={ariaFieldLabel}
      onClick={toggleList}
      style={fieldStyles}
      onKeyDown={(e) => {
        if (keyIsEnter(e.code)) {
          // for BE-4349. This would eat the space input for the input field, so only prevent
          // event bubbling when it is not that input
          const elem = e.target as HTMLElement
          if (elem.tagName.toLowerCase() !== 'pointer') {
            e.preventDefault()
          }
          toggleList()
        }
      }}
    >
      {props.displayMode == 'login' ? (
        <div className="keeper-favicon">
          {!faviconUrl?.length || faviconError ? (
            <RecordGlobe />
          ) : (
            <img
              width={24}
              height={24}
              src={faviconUrl}
              aria-label={`${props.referrer} icon`}
              onError={setFaviconError.bind(null, true)}
            />
          )}
        </div>
      ) : props.displayMode == 'card' ? (
        <CardIcon
          cardNumber={cardNumber}
          aria-label={`Payment Card ending in ${(cardNumber || '').slice(-4)}`}
        />
      ) : (
        getItemIcon(props.selectedRecord)
      )}

      <div
        style={{position: 'relative', width: '100%', marginLeft: isPasswordChangeMode ? 14 : ''}}
      >
        <div className="keeper-record-label" title={props.selectedRecord.title}>
          {props.selectedRecord.title}
        </div>
        <div className="keeper-record-field" title={fieldVal}>
          {fieldVal}
        </div>
      </div>

      {hasMultipleRecords && (
        <div className="keeper-record-chooser">
          <div className="keeper-dropdown-toggle" style={{width: 24, height: 24}}>
            <svg width="24px" height="24px" viewBox="0 0 24 24">
              <DropDownArrow />
            </svg>
          </div>

          {recordListOpen && (
            <div
              className="keeper-list"
              style={{
                zIndex: 1,
                top: props.displayMode == 'card' ? 51 : 48,
              }}
            >
              <div className="search-div">
                <CSSearchInput
                  onClose={() => {}}
                  promptWindow={true}
                  promptWindowInputChanged={promptWindowInputChanged}
                  setSearchValueCSAliasAction={promptAliases.setCSSearchValue}
                />
              </div>

              <div className="keeper-list-container">
                {listResults}
                {!isPasswordChangeMode && (
                  <div
                    onClick={props.createNew}
                    className="keeper-listitem-new focus-visible"
                    tabIndex={0}
                    role="link"
                    aria-label={translateThis('CreateNew', 'Create New Record')}
                  >
                    <Add width={24} />
                    <div>{translateThis('CreateNew', 'Create New Record')}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const mapCsStateToProps: MapStateToProps<StateProps, RecordFieldProps, CsStore> = (state) => {
  return {
    searchValue: state.search.value,
  }
}

export const RecordFieldSelector = connect(mapCsStateToProps, null, null, {
  context: csProxyStoreContext,
})(RecordFieldSelectorComponent)
