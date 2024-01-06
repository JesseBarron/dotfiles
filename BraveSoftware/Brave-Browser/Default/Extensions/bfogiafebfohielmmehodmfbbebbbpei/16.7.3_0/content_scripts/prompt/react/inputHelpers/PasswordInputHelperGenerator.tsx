import React, {ReactElement, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import PasswordEditor from '../../../../shared/Edit/PasswordEditor'
import locale from '../../../../shared/locale'
import {getEnforcements, getLoginTemplateId} from '../../../../shared/Redux/selectors'
import iframeUtil, {fillField} from '../../iframeUtil'
import {getTabRecordValues, getThisTabInfo} from '../../redux/getThisTabState'
import {generatePasswordComplexities} from '../../../../shared/Enforcements/generatedPasswordComplexities'
import useDraggableHeader from '../hooks/useDraggableHeader'
import messaging from '../../../lib/messaging'
import {maskString} from '../../../../shared/Misc/maskString'
import {createRecord} from '@shared/Records/record-types-utils'
import {MessagePrefixes} from '../../../../javascript/bg/src/messaging/enums'
import {ActionMessageHandlerNames} from '../../../../javascript/bg/src/messaging/actionMessageHandler/enums'
import {useCsStoreSelector} from '../../redux/csProxyStoreContext'
import {useRecordType} from '../hooks/useRecordType'

type PasswordInputHelperGeneratorProps = {
  lockId: string
  uploadRecord: (username: string, password: string) => void
}

const PASSWORD_PROMPT = locale.translateThis(
  'ext_password_prompt',
  'Let Keeper create a strong password.'
)
const FILL_AND_SAVE = locale.translateThis('Fill_and_Save_Caps', 'Fill and Save')

const PasswordInputHelperGenerator: React.FC<PasswordInputHelperGeneratorProps> = (props) => {
  const enforcements = useSelector(getEnforcements)
  const tabInfo = useCsStoreSelector(getThisTabInfo)
  const tabURL: string = tabInfo?.url || ''
  const recordValues = useCsStoreSelector(getTabRecordValues)
  const loginTemplateId = useSelector(getLoginTemplateId)
  const loginTemplate = useRecordType(loginTemplateId)

  const complexities = useMemo(() => {
    return generatePasswordComplexities(enforcements.generated_password_complexity, [tabURL])
  }, [enforcements.generated_password_complexity, tabURL])
  const privacyScreen: boolean = !!complexities?.privacyScreen

  const [password, setPassword] = useState('')

  const fillAndSaveClicked = async () => {
    if (!loginTemplate) {
      return
    }

    // autofill the field
    fillField({
      lockId: props.lockId,
      fieldData: password,
      dataKey: 'password',
      record: createRecord(loginTemplate, {
        record_uid: '',
        title: '',
        username: '',
        password,
        url: tabURL || '',
      }),
      fillPasswordSibling: true,
      retainIframe: true,
    })

    props.uploadRecord(recordValues.username, password)
  }

  // set draggable header width
  useDraggableHeader('logo')

  const showPassword = () => {
    const data = {
      lockId: props.lockId,
      valueField: maskString(password),
      rootDivId: 'keeper-hover-data-container',
      hoverKey: 'hover-data',
      isPassword: true,
      includeSiblings: true,
    }
    messaging.sendMessage(ActionMessageHandlerNames.SHOW_PREVIEW, {
      type: MessagePrefixes.ACTION,
      data,
    })
  }

  const closePasswordPreview = () => {
    messaging.sendMessage(ActionMessageHandlerNames.CLOSE_HOVER_DATA, {
      type: MessagePrefixes.ACTION,
    })
  }

  // Effect to cleanup the possibility of an orphaned preview iFrame if we're
  // hopping to the record saved screen (BE-4434)
  useEffect(() => {
    return closePasswordPreview
  })

  const generateButton = (): ReactElement => {
    const buttonProps: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > = {
      className: 'focus-visible',
      tabIndex: 0,
      onClick: fillAndSaveClicked,
    }

    buttonProps.onMouseEnter = showPassword
    buttonProps.onMouseLeave = closePasswordPreview

    return React.createElement('button', buttonProps, FILL_AND_SAVE)
  }

  return (
    <div className="password-input-helper">
      <div className="password-input-helper-instruction">{PASSWORD_PROMPT}</div>
      <PasswordEditor
        password={password}
        required={false}
        onChange={setPassword}
        showOptions={true}
        links={[tabURL]}
        canView={!privacyScreen}
        generated_password_complexity={complexities}
        showCopy={!privacyScreen}
        eyePosition="inner"
        enforceMPReentry={iframeUtil.enforceMpReentry}
        fromBA={false}
        isV2={true}
        owner={true}
      />
      {generateButton()}
    </div>
  )
}

export default PasswordInputHelperGenerator
