import {keyIsEnter} from '@shared/a11y'
import locale from '@shared/locale'
import CheckCircle from '@shared/svgMaker/check_circle'
import {RadioButtonUnchecked} from '@shared/svgMaker/radio_button_unchecked'
import classNames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'
import type {RecordV3} from '../../../../javascript/bg/src/types/cache/record'
import {extractPasskeyField} from '@shared/Records/record-types-utils'
import {useIsScrolling} from '../hooks/useIsScrolling'
import {PasskeyRecordItem} from './PasskeyRecordItem'

type PasskeyChoices = {
  records: RecordV3[]
  onConfirm: (record: RecordV3) => void
  onCancel: () => void
}

const PasskeyChoices: React.FC<PasskeyChoices> = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedUid = props.records[selectedIndex].record_uid

  const [topIsClipped, setTopIsClipped] = useState(false)
  const [bottomIsClipped, setBottomIsClipped] = useState(false)

  const listElem = useRef<HTMLDivElement>(null)

  const isScrolling = useIsScrolling(listElem)

  useEffect(() => {
    if (listElem.current) {
      const {clientHeight, scrollHeight, scrollTop} = listElem.current
      setTopIsClipped(scrollTop > 0)
      setBottomIsClipped(scrollTop + clientHeight < scrollHeight)
    }
  }, [isScrolling])

  // Update header bottom border if scroll area is clipped
  useEffect(() => {
    const header = document.querySelector('.keeper-header')
    if (header) {
      if (topIsClipped) {
        header.classList.add('bottom-border')
      } else {
        header.classList.remove('bottom-border')
      }
    }
  }, [topIsClipped])

  const listClasses = classNames('passkey-choices-list', {
    'top-is-clipped': topIsClipped,
    'bottom-is-clipped': bottomIsClipped,
  })

  return (
    <div className="passkey-choices">
      <div className="passkey-choices-list-container">
        <div
          className={listClasses}
          ref={listElem}
          role="listbox"
          aria-activedescendant={selectedUid}
        >
          {props.records.map((record, index) => {
            const passkey = extractPasskeyField(record)!.value[0]
            const {username} = passkey
            const selected = selectedIndex === index

            const icon = selected ? (
              <CheckCircle />
            ) : (
              <RadioButtonUnchecked svgColorName="#888888" />
            )

            return (
              <div
                id={record.record_uid}
                key={record.record_uid}
                className="passkey-choices-item focus-visible"
                onClick={setSelectedIndex.bind(null, index)}
                onKeyDown={(e) => {
                  if (keyIsEnter(e.key)) {
                    setSelectedIndex(index)
                  }
                }}
                role="option"
                tabIndex={0}
                aria-selected={selected}
                aria-label={username}
              >
                <PasskeyRecordItem title={record.title} username={username} trailingButton={icon} />
              </div>
            )
          })}
        </div>
      </div>
      <div className={classNames('passkey-prompt-buttons', {'top-border': bottomIsClipped})}>
        <button
          className="focus-visible"
          onClick={props.onConfirm.bind(null, props.records[selectedIndex])}
        >
          {locale.translateThis('use_passkey', 'Use Passkey')}
        </button>
      </div>
    </div>
  )
}

export default PasskeyChoices
