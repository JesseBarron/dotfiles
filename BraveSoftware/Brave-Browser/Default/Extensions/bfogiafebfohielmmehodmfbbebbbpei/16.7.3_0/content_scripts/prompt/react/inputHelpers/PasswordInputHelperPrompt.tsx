import React from 'react'
import locale from '../../../../shared/locale'
import {
  closeInputHelper,
  getInputValueForLock,
} from '../../../misc_functions/elementHelpers/launchInputHelper'
import {promptAliases} from '../../redux/aliases'
import {useCsStoreDispatch, useCsStoreSelector} from '../../redux/csProxyStoreContext'
import {getTabRecordValues, getTabUploadState} from '../../redux/getThisTabState'

const SAVE_PROMPT = locale.translateThis('ext_save_to_keeper', 'Save password to Keeper?')
const NO_THANKS = locale.translateThis('no_thanks', 'No Thanks')
const YES = locale.translateThis('Yes', 'Yes')

type PasswordInputHelperPromptProps = {
  lockId: string
  uploadRecord: (username: string, password: string) => void
}

const PasswordInputHelperPrompt: React.FC<PasswordInputHelperPromptProps> = (props) => {
  const csDispatch = useCsStoreDispatch()
  const uploadState = useCsStoreSelector(getTabUploadState)
  const recordValues = useCsStoreSelector(getTabRecordValues)
  const {username} = recordValues

  const noThanksClicked = () => {
    csDispatch(promptAliases.setPopupSuppressed('password'))
    closeInputHelper()
  }

  const yesClicked = async () => {
    // short circuit if uploading
    if (uploadState.pending) return

    const password = await getInputValueForLock(props.lockId)

    props.uploadRecord(username, password || '')
  }

  return (
    <div className="password-input-helper">
      <div className="password-input-helper-instruction">{SAVE_PROMPT}</div>
      <div className="password-input-helper-prompt-buttons">
        <button className="focus-visible" tabIndex={0} onClick={noThanksClicked}>
          {NO_THANKS}
        </button>
        <button className="focus-visible" tabIndex={0} onClick={yesClicked}>
          {YES}
        </button>
      </div>
    </div>
  )
}

export default PasswordInputHelperPrompt
