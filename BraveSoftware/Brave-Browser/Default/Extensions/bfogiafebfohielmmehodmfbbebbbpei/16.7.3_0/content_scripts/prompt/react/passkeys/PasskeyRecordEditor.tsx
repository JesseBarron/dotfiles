import locale from '@shared/locale'
import {PasskeyField} from '@shared/Passkey/PasskeyField'
import Login from '@shared/svgMaker/login'
import type {RecordV3} from 'custom/javascript/bg/src/types/cache/record'
import React, {ChangeEventHandler} from 'react'

// Take a record, and an update record function
type PasskeyRecordEditorProps = {
  record: RecordV3
  onChange: (record: RecordV3) => void
  username: string
  relyingParty: string
}

type ChangeHandler = ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>

export const PasskeyRecordEditor: React.FC<PasskeyRecordEditorProps> = (props) => {
  const {username, relyingParty, record} = props
  const {title, notes = ''} = record

  const onChange: ChangeHandler = (event) => {
    const {name, value} = event.target

    // Make new copy with new value
    switch (name) {
      case 'title':
      case 'notes':
        props.onChange({
          ...props.record,
          [name]: value,
        })
        break

      default:
        throw new Error(`unexpected field name ${name}`)
    }
  }

  return (
    <div className="passkey-record-editor">
      {/* Title */}
      <div className="passkey-record-editor-title">
        <div className="login-svg-container">
          <Login height={24} width={24} svgColorName={'#1B74DA'} />
        </div>
        <input
          id={'title'}
          name={'title'}
          aria-label="Title"
          className="focus-visible"
          value={title}
          placeholder={locale.translateThis('title_header', 'Title')}
          onChange={onChange}
        />
      </div>

      {/* Passkey */}
      <div className="passkey-record-editor-passkey">
        <PasskeyField
          mode="view"
          username={username}
          relyingParty={relyingParty}
          defaultExpanded={true}
        />
      </div>

      {/* Notes */}
      <div className="passkey-record-editor-notes">
        <label htmlFor={'notes'}>{locale.translateThis('note', 'Note')}</label>
        <textarea
          id={'notes'}
          name={'notes'}
          className="focus-visible"
          value={notes}
          placeholder={locale.translateThis('note', 'Note')}
          onChange={onChange}
          rows={1}
        />
      </div>
    </div>
  )
}
