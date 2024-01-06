import React, {useState, useRef, useEffect} from 'react'
import {translateThis} from '../../../shared/locale'
import {getExtensionBaseURL} from '../../../shared/getExtensionBaseURL'
import messaging from '@content_scripts/lib/messaging'
import {ActionMessageHandlerNames} from 'custom/javascript/bg/src/messaging/actionMessageHandler/enums'
import {MessagePrefixes} from 'custom/javascript/bg/src/messaging/enums'

export type DeviceApprovalBlockpProps = {
  keeperPushWaiting?: boolean
  keeperPushClicked?: (e: React.MouseEvent) => void
  requestAdminApprovalClicked?: (e: React.MouseEvent) => void
}
export const DeviceApprovalBlock: React.FC<DeviceApprovalBlockpProps> = ({
  keeperPushClicked = () => {},
  requestAdminApprovalClicked = () => {},
  keeperPushWaiting = true,
}: DeviceApprovalBlockpProps) => {
  const [isKeeperPushWaiting, setIsKeeperPushWaiting] = useState<boolean>(false)
  const ref = useRef(null)
  async function loadLottie() {
    const {default: lottie} = await import('lottie-web/build/player/lottie_light')
    return lottie
  }
  const handleKeeperPushClicked = (e: React.MouseEvent) => {
    if (keeperPushWaiting) {
      loadLottie().then((lottie) => {
        if (ref.current == null) return
        lottie.loadAnimation({
          container: ref.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: getExtensionBaseURL() + '/images/json-format/logoSpinnerBlue/LogoSpinnerBlue.json',
        })
      })
    }
    setIsKeeperPushWaiting(keeperPushWaiting)
    keeperPushClicked(e)
  }

  useEffect(() => {
    const handleTabClose = () => {
      messaging.sendMessage(ActionMessageHandlerNames.CLOSE_TAB_SSO_AMH, {
        type: MessagePrefixes.ACTION,
      })
    }

    window.addEventListener('beforeunload', handleTabClose)

    return () => {
      window.removeEventListener('beforeunload', handleTabClose)
    }
  }, [])

  return (
    <div id="device-approval">
      {!isKeeperPushWaiting ? (
        <>
          <div className="device-approval-message">
            {translateThis('approve_this_device_by_method_below')}
          </div>
          <button
            id="send_keeper_push"
            className="device-approval-option"
            onClick={handleKeeperPushClicked}
          >
            {translateThis('send_keeper_push')}
          </button>
          <button
            id="request_admin_approval"
            className="device-approval-option"
            onClick={requestAdminApprovalClicked}
          >
            {translateThis('request_admin_approval')}
          </button>
        </>
      ) : (
        <>
          <div className="device-approval-message" style={{display: 'none'}}>
            {translateThis('approve_this_device_by_method_below')}
          </div>
          <button
            id="send_keeper_push"
            className="device-approval-option"
            style={{display: 'none'}}
            onClick={handleKeeperPushClicked}
          >
            {translateThis('send_keeper_push')}
          </button>
          <button
            id="request_admin_approval"
            className="device-approval-option"
            style={{display: 'none'}}
            onClick={requestAdminApprovalClicked}
          >
            {translateThis('request_admin_approval')}
          </button>
          <div className="keeper-push-header">
            <div>{translateThis('keeper_push_sent')}</div>
            <div
              title={translateThis(
                'keeper_push_description',
                'Keeper Push is a simple account security method that uses one-touch instead of codes. When you log into Keeper on a new device, you will receive a one-touch prompt on your other device.'
              )}
            ></div>
          </div>
          <div className="keeper-push-sub-header">
            {translateThis('ext_push_notif', 'Push notification sent to approved device.')}
          </div>
          <div className="preloader" ref={ref}></div>
          <div className="need-help focus-visible">{translateThis('need_help_question')}</div>
          <div className="notifications-enabled">
            {translateThis('notifications_enabled_reminder')}
          </div>
        </>
      )}
    </div>
  )
}
