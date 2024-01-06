import React, {useEffect, useRef, useState} from 'react'
import {keeperRecord, KeeperRecordElement} from '../inner/class-functions/records'

export const Record = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [isPropertiesDefined, setIsPropertiesDefined] = useState<boolean>(false)
  useEffect(() => {
    if (ref.current == null) return
    if (
      ref.current.hasOwnProperty('records') &&
      ref.current.hasOwnProperty('showAll') &&
      ref.current.hasOwnProperty('record') &&
      isPropertiesDefined
    )
      return
    setIsPropertiesDefined(true)
    Object.defineProperty(ref.current, 'records', {
      get: keeperRecord.getRecords,
      set: keeperRecord.setRecords,
    })
    Object.defineProperty(ref.current, 'showAll', {
      get: keeperRecord.getShowAll,
      set: keeperRecord.setShowAll,
    })
    Object.defineProperty(ref.current, 'record', {
      get: keeperRecord.getRecord,
      set: keeperRecord.setRecord,
    })
  }, [ref, isPropertiesDefined])
  return <div className="keeper-record" id="keeper-record" ref={ref}></div>
}
