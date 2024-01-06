import React, {useEffect} from 'react'
import {keeperList} from '../../prompt/inner/class-functions/selects'

export interface KeeperListProps {
  zIndex: string
  top: string
  handleRecordSelect: () => void
  children?: React.ReactNode
}
export const KeeperList = React.forwardRef<HTMLDivElement, KeeperListProps>(
  ({zIndex, top, handleRecordSelect, children}, curRef) => {
    useEffect(() => {
      const ref = curRef as React.RefObject<HTMLDivElement>
      if (ref.current == null) return
      ref.current.addEventListener('recordSelect', () => {
        handleRecordSelect()
      })
      Object.defineProperty(ref.current, 'selectedItem', {
        get: keeperList.getSelectedItem,
        set: keeperList.setSelectedItem,
      })

      Object.defineProperty(ref.current, 'showNewItemOption', {
        get: keeperList.getShowNewItemOption,
        set: keeperList.setShowNewItemOption,
      })

      Object.defineProperty(ref.current, 'type', {
        get: keeperList.getType,
      })

      Object.defineProperty(ref.current, 'items', {
        get: keeperList.getItems,
        set: keeperList.setItems,
      })
    }, [curRef])
    return (
      <div
        className="keeper-list"
        id="keeper-list"
        style={{top: top, zIndex: zIndex}}
        role="combobox"
        ref={curRef}
      >
        <div className="keeper-list-container" id="keeper-list-container">
          {children}
        </div>
      </div>
    )
  }
)
