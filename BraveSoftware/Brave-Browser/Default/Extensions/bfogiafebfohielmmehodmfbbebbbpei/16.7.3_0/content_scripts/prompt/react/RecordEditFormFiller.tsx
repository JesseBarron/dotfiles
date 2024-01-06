import React, {useCallback, useEffect, useLayoutEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import RecordEdit, {AnchoredSaveButton} from '../../../shared/Edit/RecordEdit'
import {
  canCreateLoginRecords,
  getEnforcements,
  getLoginTemplateId,
  getSyncValue,
} from '../../../shared/Redux/selectors'
import iframeUtil from '../iframeUtil'
import ProfileCardEditor from '../../../shared/Edit/ProfileCardEditor'
import {isPaymentCard, PaymentCard} from '../../../javascript/bg/src/types/cache/paymentCard'
import {Address, isAddress} from '../../../javascript/bg/src/types/cache/address'
import ProfileAddressEditor from '../../../shared/Edit/ProfileAddressEditor'
import {isRecord, isRecordV3, Record} from '../../../javascript/bg/src/types/cache/record'
import useResizeDetector from './hooks/useResizeDetector'
import {useFolders} from './hooks/useFolders'
import {closeFormFiller} from '../misc/closeFormFiller'
import {useWidth} from './hooks/useWidth'
import locale from '../../../shared/locale'
import {constants} from '../../contentScriptsConstants'
import {getTabUploadState, getThisTabInfo} from '../redux/getThisTabState'
import {UploadRecordOptions} from '../../../javascript/bg/src/records/uploadRecord'
import {promptAliases} from '../redux/aliases'
import {overlayAlert} from '../../../shared/overlayAlertVanilla'
import useDraggableHeader from './hooks/useDraggableHeader'
import {useFirstUpdate} from './hooks/useFirstUpdate'
import {createRecord} from '@shared/Records/record-types-utils'
import {useRecordType} from './hooks/useRecordType'
import {getTrimmedUrl} from '../../../shared/helpers'
import {useCsStoreDispatch, useCsStoreSelector} from '../redux/csProxyStoreContext'

import type {RecordDefaultValues} from '../../../javascript/bg/src/redux/records/defaults'
import type {KeeperExtensionPromptElement} from '../inner/class-functions/containers'
import type {Phone} from '../../../javascript/bg/src/types/cache/phone'

type RecordEditFormFillerProps = {
  record: Record | PaymentCard | Address | Phone | null
  mode: 'record' | 'card' | 'address'
  defaults: RecordDefaultValues
  uploadProfileRecord: (payload: PaymentCard | Address, mode: 'card' | 'address') => void
  borderedFields?: boolean
  showCopy?: boolean
  fromBA: boolean
  isDarkMode?: boolean
}

const RecordEditFormFiller: React.FC<RecordEditFormFillerProps> = (props) => {
  const {record, mode} = props
  const csDispatch = useCsStoreDispatch()
  const loginTemplateId = useSelector(getLoginTemplateId)
  const canCreateLogins = useSelector(canCreateLoginRecords)
  const isRTL = locale.useRTL()

  const type = useMemo(() => {
    if (record && isRecordV3(record)) {
      return record.type
    } else if (!record) {
      switch (mode) {
        case 'record':
          return loginTemplateId
        case 'card':
          return 'bankCard'
        case 'address':
          return 'address'
      }
    }
    return ''
  }, [record, mode])
  const recordType = useRecordType(type)

  // Clear any outstanding upload state on first load, in case it hasn't been cleared.
  // This shouldn't happen but here as a failsafe.
  useEffect(() => {
    csDispatch(promptAliases.clearUploadState())
  }, [])

  // Catch any attempts to create a login records when restricted not to
  useEffect(() => {
    if (mode === 'record' && !record && !canCreateLogins) {
      iframeUtil.loadExtensionContents({
        name: 'restrictedAlert',
        width: 310,
        lockId: '',
      })
    }
  }, [canCreateLogins, mode, record])

  const uploadState = useCsStoreSelector(getTabUploadState)
  const uploadRecord = useCallback((rec: Record, options?: UploadRecordOptions) => {
    csDispatch(promptAliases.setDoRefreshRecords(true))
    csDispatch(promptAliases.setAndRequestUploadRecord(rec, options))
  }, [])

  // Use max height
  const keeperExtensionContent = document.querySelector<HTMLElement>('keeper-extension-content')
  useEffect(() => {
    if (keeperExtensionContent) {
      keeperExtensionContent.style.maxHeight = '520px'
      keeperExtensionContent.style.overflowY = 'overlay'
      keeperExtensionContent.style.overflowX = 'hidden'
      keeperExtensionContent.style.paddingLeft = isRTL ? '8px' : '16px'
      keeperExtensionContent.style.paddingRight = isRTL ? '16px' : '8px'
    }
    return function removeMaxHeight() {
      if (keeperExtensionContent) {
        keeperExtensionContent.style.paddingRight = ''
        keeperExtensionContent.style.maxHeight = ''
        keeperExtensionContent.style.overflowY = ''
        keeperExtensionContent.style.overflowX = ''
      }
    }
  })

  // add a resize listener to update iFrame height on field height changes
  const rootHeight: number = useResizeDetector('record-edit-root')

  // Use new design for v3 record edits, or if our props tell us to (re: ReviewSavedRecord component)
  const isRTRecord: boolean = (record && isRecordV3(record)) || (!record && Boolean(recordType))
  const useNewDesign: boolean =
    (process.env.FEATURE_USABILITY_IMPROVEMENTS_2 && isRTRecord) || !!props.borderedFields
  const widthSet: boolean = useWidth(
    useNewDesign ? constants.EDIT_SCREEN_WIDTH : constants.FORM_FILLER_WIDTH
  )
  useDraggableHeader(useNewDesign ? 'edit-usability' : 'edit')

  // Get folders
  const syncValue = useSelector(getSyncValue)
  const folders = useFolders([syncValue])

  // This view is in keeper-extension hierarchy so we know this is here for sure
  const extension: KeeperExtensionPromptElement =
    iframeUtil.getOverlay() as KeeperExtensionPromptElement

  // Keep hidden until full size reached to prevent clipping by iFrame
  // Need to do this outside of an effect because those run after a render, not before
  const isFirstUpdate: boolean = useFirstUpdate()
  if (isFirstUpdate) {
    extension.style.visibility = 'hidden'
  }

  // Reveal editor once height and width of iFrame have expanded to fit contents
  useLayoutEffect(() => {
    if (!isFirstUpdate && widthSet && rootHeight > 0) {
      extension.style.visibility = 'visible'
    }
  }, [isFirstUpdate, rootHeight > 0, widthSet])

  const enforcements = useSelector(getEnforcements)

  // Success handler
  const onSuccess = useCallback(() => {
    if (useNewDesign) {
      // do nothing, all state change handled in RecordEdit and we don't autofill
    } else {
      overlayAlert(locale.translateThis('fastfill_RecordSaved'), 'check', undefined, {
        textAlign: 'center',
      })

      if (enforcements?.master_password_reentry?.operations?.length) {
        closeFormFiller()
      } else if (uploadState.record) {
        extension.fill(uploadState.record, false, true)
      }
    }
  }, [uploadState.record, enforcements, useNewDesign])

  // ok clicked
  const okClicked = useCallback(
    (record: Record) => {
      if (useNewDesign) {
        extension.fill(record, false, false, props.mode)
      } else {
        closeFormFiller()
      }
    },
    [useNewDesign, props.mode]
  )

  const tabInfo = useCsStoreSelector(getThisTabInfo)

  // Use RecordEditComponent if:
  if (
    // is existing record v2/v3
    (record && isRecord(record)) ||
    // new v3 record and template available
    (!record && recordType)
  ) {
    const saveBtnProps: AnchoredSaveButton | undefined = useNewDesign
      ? {
          enabledLabel: locale.translateThis('Save'),
          disabledLabel: locale.translateThis('Fill Record'),
          portalRoot: extension,
        }
      : undefined

    // Use uploadState.record for most up-to-date version, the props record
    // is just the initially passed in one, and won't reflect our changes if a user
    // uploads a few different changes in the same editing session
    const recordToEdit: Record =
      uploadState.record || record || createRecord(recordType!, props.defaults)
    const showSaved: boolean = useNewDesign && !!uploadState.record

    return (
      <RecordEdit
        record={recordToEdit}
        bordered={useNewDesign}
        showCopy={useNewDesign}
        headerSaveButton={!useNewDesign}
        anchoredSaveButton={saveBtnProps}
        showSaved={showSaved}
        recordType={recordType}
        folders={useNewDesign ? folders : undefined}
        uploadError={uploadState.error}
        uploadPending={uploadState.pending}
        uploadRecord={uploadRecord}
        onSuccess={onSuccess}
        onExit={closeFormFiller}
        clearError={() => console.log('clearError')}
        faviconUrl={tabInfo?.faviconUrl}
        faviconText={getTrimmedUrl(tabInfo?.url || '')}
        useFavicon={!useNewDesign}
        okClicked={okClicked}
        enforceMPReentry={iframeUtil.enforceMpReentry}
        fromBA={false}
        defaults={props.defaults}
      />
    )
  }

  // new/existing profile card
  if (mode == 'card') {
    if (!record || isPaymentCard(record)) {
      return (
        <ProfileCardEditor
          fromBA={props.fromBA}
          card={record}
          uploadCard={(card) => props.uploadProfileRecord(card, 'card')}
          enforceMPReentry={iframeUtil.enforceMpReentry}
        />
      )
    }
  }

  // new/existing profile address
  if (mode == 'address') {
    if (!record || isAddress(record)) {
      return (
        <ProfileAddressEditor
          fromBA={props.fromBA}
          address={record}
          uploadAddress={(address) => props.uploadProfileRecord(address, 'address')}
          enforceMPReentry={iframeUtil.enforceMpReentry}
        />
      )
    }
  }

  return null
}

export default RecordEditFormFiller
