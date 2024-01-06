import React from 'react'
import locale from '../../../../../../shared/locale'

const KeeperHeaderLogo: React.FC = () => {
  const direction = locale.useRTL() ? 'rtl' : 'ltr'

  return <div className={`keeper-logo ${direction}`} />
}

export default KeeperHeaderLogo
