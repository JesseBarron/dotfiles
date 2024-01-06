import React, {useCallback, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {overlayAlert} from '../../../../shared/overlayAlertVanilla'
import {getCommonLogins, getLoginTemplateId} from '../../../../shared/Redux/selectors'
import {
  getReviewSavedRecordShowing,
  getTabRecordValues,
  getTabUploadState,
  getThisTabInfo,
} from '../../redux/getThisTabState'
import {useFirstUpdate} from '../hooks/useFirstUpdate'
import PasswordInputHelperGenerator from './PasswordInputHelperGenerator'
import PasswordInputHelperPrompt from './PasswordInputHelperPrompt'
import {createRecord} from '@shared/Records/record-types-utils'
import {promptAliases} from '../../redux/aliases'
import getOriginAndPath from '../../../../shared/Misc/getOriginAndPath'
import {useCsStoreDispatch, useCsStoreSelector} from '../../redux/csProxyStoreContext'
import {useRecordType} from '../hooks/useRecordType'

import type {RecordDefaultValues} from '../../../../javascript/bg/src/redux/records/defaults'
import type {Record} from '../../../../javascript/bg/src/types/cache/record'
import type {ReviewSavedRecordShowing} from '../../../../javascript/bg/src/redux-cs/tab'

type PasswordInputHelperProps = {
  lockId: string
}

const PasswordInputHelper: React.FC<PasswordInputHelperProps> = (props) => {
  const csDispatch = useCsStoreDispatch()
  const {useGeneratedPassword} = useCsStoreSelector(getTabRecordValues)
  const uploadState = useCsStoreSelector(getTabUploadState)
  const reviewSavedRecordState = useCsStoreSelector(getReviewSavedRecordShowing)
  const tabInfo = useCsStoreSelector(getThisTabInfo)
  const tabURL: string = tabInfo?.url || ''
  const logins = useSelector(getCommonLogins)
  const loginTemplateId = useSelector(getLoginTemplateId)
  const loginTemplate = useRecordType(loginTemplateId)

  const [userPass, setUserPass] = useState({username: '', password: ''})

  // Error message
  useEffect(() => {
    if (uploadState.error) {
      overlayAlert(uploadState.error, 'warning')
    }
  }, [uploadState.error])

  const prepareReviewSavedRecordState = useCallback(
    (username: string, password: string) => {
      setUserPass({username, password})
      if (tabInfo) {
        const reviewSavedRecordShowing: ReviewSavedRecordShowing = {
          tabId: tabInfo.id,
          value: true,
        }
        csDispatch(promptAliases.setReviewSavedRecordShowing(reviewSavedRecordShowing))
      }
    },
    [tabInfo]
  )

  useEffect(() => {
    const uploadRecord = async () => {
      if (!reviewSavedRecordState || !loginTemplate) return

      const values: RecordDefaultValues = {
        record_uid: '',
        title: tabInfo?.title ?? '',
        username: userPass.username || logins.emails[0] || '', // fall back to Keeper email
        password: userPass.password,
        url: getOriginAndPath(tabURL),
      }
      const record: Record = createRecord(loginTemplate, values)

      csDispatch(promptAliases.uploadAndOpenReviewChanges(record))
    }
    uploadRecord()
  }, [reviewSavedRecordState])

  if (useGeneratedPassword) {
    return (
      <PasswordInputHelperGenerator
        uploadRecord={prepareReviewSavedRecordState}
        lockId={props.lockId}
      />
    )
  } else {
    return (
      <PasswordInputHelperPrompt
        uploadRecord={prepareReviewSavedRecordState}
        lockId={props.lockId}
      />
    )
  }
}

export default PasswordInputHelper
