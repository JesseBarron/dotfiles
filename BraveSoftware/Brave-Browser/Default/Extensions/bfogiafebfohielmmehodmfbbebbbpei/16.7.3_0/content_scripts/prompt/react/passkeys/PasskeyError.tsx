import {closeFormFiller} from '@content_scripts/prompt/misc/closeFormFiller'
import locale from '@shared/locale'
import React from 'react'

type PasskeyErrorProps = {
  error: string
}

export const PasskeyError: React.FC<PasskeyErrorProps> = (props) => {
  const {error} = props

  return (
    <div className="passkey-prompt-content">
      <div role="alert" className="passkey-error">
        {error}
      </div>
      <div className="passkey-prompt-buttons">
        <button className="focus-visible" onClick={closeFormFiller}>
          {locale.translateThis('OK')}
        </button>
      </div>
    </div>
  )
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error) || 'Unknown error'
}
