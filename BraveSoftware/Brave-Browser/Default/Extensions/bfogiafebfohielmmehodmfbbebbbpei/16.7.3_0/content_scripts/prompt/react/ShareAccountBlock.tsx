import React from 'react'
import locale from '../../../shared/locale'
import messaging from '@content_scripts/lib/messaging'
import {ActionMessageHandlerNames} from 'custom/javascript/bg/src/messaging/actionMessageHandler/enums'
import {MessagePrefixes} from 'custom/javascript/bg/src/messaging/enums'

export type ShareAccountBlockProps = {
  // preloaded message from KA with transfer expiration date
  message: string
}

export const ShareAccountBlock: React.FC<ShareAccountBlockProps> = (props) => {
  // Yes, we're re-using device approval block styles
  return (
    <div id="device-approval">
      <div className="device-approval-message">{props.message}</div>
      <button
        id="send_keeper_push"
        className="device-approval-option"
        onClick={shareAccountConfirmed}
      >
        {locale.translateThis('Accept')}
      </button>
      <button
        id="request_admin_approval"
        className="device-approval-option"
        onClick={shareAccountDeclined}
      >
        {locale.translateThis('Close')}
      </button>
    </div>
  )
}

function shareAccountConfirmed(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.disabled = true
  messaging.sendMessage(ActionMessageHandlerNames.ACCOUNT_SHARE_CONFIRMATION, {
    type: MessagePrefixes.ACTION,
    data: {
      confirm: true,
    },
  })
}

function shareAccountDeclined(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault()

  e.currentTarget.disabled = true
  messaging.sendMessage(ActionMessageHandlerNames.ACCOUNT_SHARE_CONFIRMATION, {
    type: MessagePrefixes.ACTION,
    data: {
      confirm: false,
    },
  })
}
