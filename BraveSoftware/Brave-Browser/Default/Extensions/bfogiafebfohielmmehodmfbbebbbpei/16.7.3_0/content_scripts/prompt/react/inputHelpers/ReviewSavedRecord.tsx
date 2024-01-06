import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import RecordEdit, {AnchoredSaveButton} from '../../../../shared/Edit/RecordEdit'
import {getTabUploadState} from '../../redux/getThisTabState'
import useDraggableHeader from '../hooks/useDraggableHeader'
import {promptAliases} from '../../redux/aliases'
import {useFolders} from '../hooks/useFolders'
import {closeFormFiller} from '../../misc/closeFormFiller'
import iframeUtil from '../../iframeUtil'
import locale from '../../../../shared/locale'
import {getLoginTemplateId, getSyncValue} from '../../../../shared/Redux/selectors'
import {removeInputObservers} from '../../../misc_functions/elementHelpers/launchInputHelper'
import {useRecordType} from '../hooks/useRecordType'
import {useCsStoreDispatch, useCsStoreSelector} from '../../redux/csProxyStoreContext'

import type {Record} from '../../../../javascript/bg/src/types/cache/record'
import type {UploadRecordOptions} from '../../../../javascript/bg/src/records/uploadRecord'

const ReviewSavedRecord: React.FC = (props) => {
  // set draggable header width
  useDraggableHeader('logo')

  const uploadState = useCsStoreSelector(getTabUploadState)
  const csDispatch = useCsStoreDispatch()
  const loginTemplateId = useSelector(getLoginTemplateId)
  const loginTemplate = useRecordType(loginTemplateId)

  const syncValue = useSelector(getSyncValue)
  const folders = useFolders([syncValue])

  // We can remove input observers once we reach this view
  useEffect(() => {
    removeInputObservers()
  }, [])

  const uploadRecord = useCallback((rec: Record, options?: UploadRecordOptions) => {
    csDispatch(promptAliases.setAndRequestUploadRecord(rec, options))
  }, [])

  if (!uploadState.record) {
    return null
  }

  const portalRoot = document.getElementById('keeper-extension')

  const saveButtonProps: AnchoredSaveButton | undefined = portalRoot
    ? {
        enabledLabel: locale.translateThis('Save'),
        disabledLabel: locale.translateThis('OK'),
        portalRoot: portalRoot,
      }
    : undefined

  return (
    <div className="review-saved-record">
      <RecordEdit
        record={uploadState.record}
        bordered={true}
        recordType={loginTemplate}
        uploadError={uploadState.error}
        uploadPending={uploadState.pending}
        uploadRecord={uploadRecord}
        onSuccess={useCallback(() => console.log('onSuccess'), [])}
        clearError={useCallback(() => console.log('clearError'), [])}
        onExit={closeFormFiller}
        headerSaveButton={false}
        folders={folders}
        showCopy={true}
        useFavicon={false}
        showSaved={!!uploadState.record}
        anchoredSaveButton={saveButtonProps}
        overlayStyle={{borderRadius: 8}}
        okClicked={closeFormFiller}
        enforceMPReentry={iframeUtil.enforceMpReentry}
        fromBA={false}
      />
    </div>
  )
}

export default ReviewSavedRecord
