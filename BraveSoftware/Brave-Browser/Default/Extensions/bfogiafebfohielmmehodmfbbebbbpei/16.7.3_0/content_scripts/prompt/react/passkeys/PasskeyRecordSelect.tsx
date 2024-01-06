import iframeUtil from '@content_scripts/prompt/iframeUtil'
import locale from '@shared/locale'
import {AddCircle} from '@shared/svgMaker/add_circle'
import Check from '@shared/svgMaker/check'
import DropDownArrow from '@shared/svgMaker/dropDownArrow'
import classNames from 'classnames'
import {RecordV3} from 'custom/javascript/bg/src/types/cache/record'
import {
  extractLoginField,
  extractPasskeyField,
  hasPasskey,
} from '@shared/Records/record-types-utils'
import _debounce from 'lodash/debounce'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Select, {
  components,
  GroupHeadingProps,
  MenuListProps,
  OnChangeValue,
  OptionProps,
} from 'react-select'
import {useIsScrolling} from '../hooks/useIsScrolling'
import {PasskeyRecordItem} from './PasskeyRecordItem'

type RecOptionGroup = {
  options: RecOption[]
  useHeading: boolean
}

type RecOption = {
  value: string
  label: string
  title: string
  username: string
  hasPasskey: boolean
}

type PasskeyRecordSelectProps = {
  selectedUid: string
  records: RecordV3[]
  onSelect: (uid: string) => void
}

export const PasskeyRecordSelect: React.FC<PasskeyRecordSelectProps> = (props) => {
  const {records} = props

  const [isOpen, setIsOpen] = useState(false)

  const selectGroups: RecOptionGroup[] = useMemo(() => {
    const createNewGroup: RecOptionGroup = {
      useHeading: false,
      options: [
        {
          label: locale.translateThis('CreateNew', 'Create New Record'),
          value: '',
          title: '',
          username: '',
          hasPasskey: false,
        },
      ],
    }

    const passkeyGroup: RecOptionGroup = {useHeading: true, options: []}
    const passwordGroup: RecOptionGroup = {useHeading: true, options: []}

    records.forEach((record) => {
      const {title, record_uid} = record
      const _hasPasskey = hasPasskey(record)
      const passkeyUsername = _hasPasskey
        ? extractPasskeyField(record)!.value[0].username
        : undefined
      const loginUsername = extractLoginField(record)?.value[0]
      const username: string = passkeyUsername || loginUsername || ''

      const recOption: RecOption = {
        value: record_uid,
        label: locale.translateThis('update_xxx', 'Update XXX').replace('XXX', title),
        title,
        username,
        hasPasskey: _hasPasskey,
      }
      if (_hasPasskey) {
        passkeyGroup.options.push(recOption)
      } else {
        passwordGroup.options.push(recOption)
      }
    })

    return [createNewGroup, passkeyGroup, passwordGroup]
  }, [records])

  const selectOnChange = useCallback(
    (value: OnChangeValue<RecOption, false>) => {
      const recordUid = value?.value
      props.onSelect(recordUid ?? '')
    },
    [props.onSelect]
  )

  const onMenuOpen = useCallback(() => {
    setIsOpen(true)
    // need extra height for menu
    iframeUtil.updateFrameHeight(120)
  }, [])

  const onMenuClose = useCallback(() => {
    setIsOpen(false)
    // restore to true height
    iframeUtil.updateFrameHeight()
  }, [])

  // Get selected value option
  const value: RecOption = useMemo(() => {
    const [createNewGroup, passkeyGroup, passwordGroup] = selectGroups
    const joinedGroups = createNewGroup.options.concat(passkeyGroup.options, passwordGroup.options)
    return joinedGroups.find((option) => option.value === props.selectedUid)!
  }, [selectGroups, props.selectedUid])

  return (
    <Select
      className="passkey-record-select"
      classNames={{
        control: () => classNames('passkey-record-select-control', {isOpen}),
        valueContainer: () => 'passkey-record-select-value-container',
        indicatorsContainer: () => 'passkey-record-select-indicators-container',
        menu: () => 'passkey-record-select-menu',
      }}
      components={{
        DropdownIndicator: DropDownArrow,
        Option: PasskeyCreateOption,
        GroupHeading: GroupDivider,
        MenuList: RecordMenuList,
      }}
      options={selectGroups}
      isClearable={false}
      isSearchable={false}
      isMulti={false}
      menuShouldBlockScroll={false}
      menuShouldScrollIntoView={true}
      captureMenuScroll={true}
      value={value}
      onMenuOpen={onMenuOpen}
      onMenuClose={onMenuClose}
      onChange={selectOnChange}
      menuIsOpen={isOpen}
      // menuIsOpen={true} // useful for debugging menu styles
      maxMenuHeight={280}
      unstyled={true}
    />
  )
}

type PasskeyCreateOptionProps = OptionProps<RecOption, false, RecOptionGroup>

const PasskeyCreateOption: React.FC<PasskeyCreateOptionProps> = React.memo((props) => {
  const {data, selectOption, isSelected, isFocused} = props

  // select on click
  const onClick = useCallback(() => {
    selectOption(data)
  }, [data])

  const ref = useRef<HTMLDivElement>(null)

  // scroll into view if focused and not visible
  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.scrollIntoView({block: 'nearest'})
    }
  }, [isFocused])

  if (!data.value) {
    const createNewClasses = classNames('passkey-record-select-option', 'create-new-record', {
      focused: isFocused,
    })
    return (
      <div ref={ref} className={createNewClasses} onClick={onClick}>
        <AddCircle svgColorName="#1B74DA" />
        <span>{locale.translateThis('CreateNew', 'Create New Record')}</span>
        {isSelected && <Check width={24} height={24} />}
      </div>
    )
  } else {
    const {title, username, hasPasskey} = data
    const recordOptionClasses = classNames('passkey-record-select-option', {
      focused: isFocused,
    })

    const check = isSelected ? <Check svgColorName="black" width={24} height={24} /> : undefined

    return (
      <PasskeyRecordItem
        itemRef={ref}
        className={recordOptionClasses}
        onClick={onClick}
        title={title}
        username={username}
        hidePasskeyIcon={!hasPasskey}
        trailingButton={check}
      />
    )
  }
})

type RecordMenuListProps = MenuListProps<RecOption, false, RecOptionGroup>

const RecordMenuList: React.FC<RecordMenuListProps> = (props) => {
  const ref = useRef<HTMLDivElement>(null)

  const isScrolling = useIsScrolling(ref)

  const classes = classNames('passkey-record-select-menu-list', props.className, {
    isScrolling,
  })

  return (
    <components.MenuList {...props} innerRef={ref} className={classes}>
      {props.children}
    </components.MenuList>
  )
}

type GroupDividerProps = GroupHeadingProps<RecOption, false, RecOptionGroup>

const GroupDivider: React.FC<GroupDividerProps> = (props) => {
  const {data} = props
  if (!data.useHeading) {
    return null
  }

  return (
    <div className="passkey-record-select-group-divider">
      <div></div>
    </div>
  )
}
