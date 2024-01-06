import React from 'react'
import {translateThis} from '../../../shared/locale'

export type DuoBlockProps = {
  duoMessageContent: string
  duoCapabilities: string[]
  onButtonClicked: (e: React.MouseEvent<HTMLButtonElement>, mode: string) => void
}

export const DuoBlock: React.FC<DuoBlockProps> = ({
  duoMessageContent,
  duoCapabilities,
  onButtonClicked,
}: DuoBlockProps) => {
  const buttonConfigs = [
    ['push', 'duo_push'],
    ['sms', 'duo_text_message'],
    ['phone', 'duo_voice_call'],
  ]

  return (
    <div id="keeper-duo">
      <div className="logo"></div>
      <div className="message">{duoMessageContent}</div>
      <div className="duobuttons">
        {buttonConfigs.map((config) => {
          const mode = config[0]
          const translationKey = config[1]

          const clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
            // e.preventDefault()

            onButtonClicked(e, mode)
          }

          return (
            <button
              id={`duo-${mode}`}
              onClick={clickHandler}
              disabled={duoCapabilities.indexOf(mode) === -1}
              className="pretty"
            >
              {translateThis(translationKey)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
