import {getThemeMode} from '@shared/Redux/selectors'
import React from 'react'
import {useSelector} from 'react-redux'
import KeeperCoin from '../../../../shared/svgMaker/KeeperCoin'

const PasskeyHeader: React.FC = () => {
  const mode = useSelector(getThemeMode)
  return (
    <div className="passkey-header">
      <KeeperCoin width={28} height={28} isDarkMode={mode === 'dark'} />
      <span id="passkey-header-title" />
    </div>
  )
}

export default PasskeyHeader
