import React from 'react'
import {translateThis} from '../../../shared/locale'
export type ExpirePulldownProps = {
  allowedTwoFactorDurations: Array<string>
}
export const ExpirePulldown = ({allowedTwoFactorDurations}: ExpirePulldownProps) => {
  return (
    <select id="expire_pulldown" style={{fontSize: '14px'}}>
      {allowedTwoFactorDurations.indexOf('0') !== -1 && (
        <option value="0">{translateThis('every_login', 'Every Login')}</option>
      )}
      {allowedTwoFactorDurations.indexOf('30') !== -1 && (
        <option value="30">{translateThis('consumer_auto_backup_option3', 'Every 30 Days')}</option>
      )}
      {allowedTwoFactorDurations.indexOf('24') !== -1 && (
        <option value="24">{translateThis('every_24_hours', 'Every 24 hours')}</option>
      )}
      {allowedTwoFactorDurations.indexOf('12') !== -1 && (
        <option value="12">{translateThis('every_twelve_hours', 'Every 12 hours')}</option>
      )}
      {allowedTwoFactorDurations.indexOf('9999') !== -1 && (
        <option value="9999">
          {translateThis('ChatSaveCodeForever', "Don't ask again on this device")}
        </option>
      )}
    </select>
  )
}
