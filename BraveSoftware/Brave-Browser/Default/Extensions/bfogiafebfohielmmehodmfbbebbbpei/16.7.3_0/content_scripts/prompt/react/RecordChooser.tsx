import React, {useRef, useEffect, useState} from 'react'
import {KeeperList} from './KeeperList'
import iframeUtil from '../../prompt/iframeUtil'
import {makeVoiceOverAlert} from '../../../shared/a11y/makeVoiceOverAlert'
import {keeperRecordChooser, KeeperRecordChooserElement} from '../inner/class-functions/records'
import messaging from '../../lib/messaging'
import {DropdownToggle} from './DropdownToggle'
import {ActionMessageHandlerNames} from '../../../javascript/bg/src/messaging/actionMessageHandler/enums'
import {MessagePrefixes} from '../../../javascript/bg/src/messaging/enums'
import {KeeperExtensionElement} from '../inner/class-functions/containers'
import {KeeperRecordElement} from '../inner/class-functions/records'
import {CSSearchInput} from '../../../shared/Search/SearchInput'
import {
  applyClosedBorders,
  applyOpenedBorders,
  AddAndRemoveWindowEventListener,
} from '../inner/inits/records'
import {promptAliases} from '../redux/aliases'
import {SetMessageHandlerNames} from '../../../javascript/bg/src/messaging/setMessageHandler/enums'
import {KeeperListElement} from '../inner/class-functions/selects'
import {CsProvider} from '../redux/helpers/CsProvider'
export const RecordChooser = ({}) => {
  const ref = useRef<HTMLDivElement & KeeperRecordChooserElement>(null)
  const keeperListRef = useRef<KeeperListElement & HTMLDivElement>(null)
  const [triggered, setTriggered] = useState<boolean>(false)
  const [topOffset, setTopOffset] = useState<string>('0px')
  const [zIndex, setZIndex] = useState<string>('0')
  useEffect(() => {
    if (ref.current == null) return
    if (ref.current?.hasOwnProperty('records') && ref.current?.hasOwnProperty('selectedItem')) {
      return
    }
    Object.defineProperty(ref.current, 'records', {
      get: keeperRecordChooser.getRecords,
      set: keeperRecordChooser.setRecords,
    })

    Object.defineProperty(ref.current, 'selectedItem', {
      get: keeperRecordChooser.getSelectedItem,
      set: keeperRecordChooser.setSelectedItem,
    })
  }, [ref])
  const handleClick = (e: React.MouseEvent<Element, MouseEvent>) => {
    const list = document.querySelector('#keeper-record-chooser #keeper-list') as KeeperListElement
    setTriggered(true)
    if (ref.current == null) return
    if (ref.current?.records.length > 1 && !list) {
      e.stopPropagation()
      trigger()
      makeVoiceOverAlert('Search field is now available')
    }
  }
  const promptWindowInputChanged = (value: string) => {
    if (ref.current == null) return
    messaging.sendMessage(ActionMessageHandlerNames.SEND_SEARCH_RESULTS, {
      type: MessagePrefixes.ACTION,
      data: {searchValue: value, source: ref.current.records},
    })
  }
  const handleRecordSelect = () => {
    if (ref.current == null) return
    if (keeperListRef.current == null) return
    ref.current.selectedItem = keeperListRef.current.selectedItem
    keeperListRef.current.remove()
    applyClosedBorders()
  }
  function trigger(): void {
    if (ref.current == null) return
    if (keeperListRef.current == null) return
    let topOffset = '0px'
    const overlay = iframeUtil.getOverlay() as KeeperExtensionElement
    const recordElement = overlay.querySelector('#keeper-record') as KeeperRecordElement
    const basicField = recordElement.refs?.basicFields
    if (basicField) {
      topOffset = basicField.offsetHeight - 1 + 'px' // to position keeper list directly below basic field
    }
    keeperListRef.current.selectedItem = ref.current.selectedItem
    keeperListRef.current.items = ref.current.records
    setZIndex(ref.current.style.zIndex + 1)
    setTopOffset(topOffset)
    applyOpenedBorders()
    messaging.sendMessage(SetMessageHandlerNames.CLOSE_RECORD_LIST_EVENT_LISTENER, {
      type: MessagePrefixes.SET,
    })

    AddAndRemoveWindowEventListener()

    // This has a max height of 300px (stylesheet) then adds a scroll.
    const listHeight = keeperListRef.current.getBoundingClientRect().height
    iframeUtil.updateFrameHeight(listHeight)
  }
  return (
    <div
      className="keeper-record-chooser"
      id="keeper-record-chooser"
      ref={ref}
      onClick={handleClick}
    >
      <DropdownToggle height="24px" width="24px"></DropdownToggle>
      {triggered && (
        <KeeperList
          zIndex={zIndex}
          top={topOffset}
          handleRecordSelect={handleRecordSelect}
          ref={keeperListRef}
        >
          <div>
            <CsProvider>
              <CSSearchInput
                onClose={() => {}}
                promptWindow={true}
                promptWindowInputChanged={promptWindowInputChanged}
                setSearchValueCSAliasAction={promptAliases.setCSSearchValue}
              />
            </CsProvider>
          </div>
        </KeeperList>
      )}
    </div>
  )
}
