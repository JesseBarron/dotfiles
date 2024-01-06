import {closeFormFiller} from '@content_scripts/prompt/misc/closeFormFiller'
import KeeperCoin from '@shared/svgMaker/KeeperCoin'
import React, {useEffect} from 'react'
import KeeperIconButton from '../components/elements/buttons/KeeperIconButton'

type PasskeySuccessProps = {
  message: string
}

export const PasskeySuccess: React.FC<PasskeySuccessProps> = (props) => {
  const {message} = props

  // close the popup after 4 seconds
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      closeFormFiller()
    }, 4000)
    return () => {
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="passkey-success">
      <KeeperCoin width={24} height={24} isDarkMode={true} />
      <span>{message}</span>
      <KeeperIconButton
        type="closeIcon"
        className="keeper-close focus-visible"
        role="button"
        aria-label="Exit Button. Close Keeper Popup"
        onClick={closeFormFiller}
      />
    </div>
  )
}
