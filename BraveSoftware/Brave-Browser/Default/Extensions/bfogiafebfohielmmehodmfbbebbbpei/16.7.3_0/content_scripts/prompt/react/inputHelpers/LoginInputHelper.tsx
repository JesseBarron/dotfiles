import React, {useEffect, useState} from 'react'
import {connect, MapDispatchToProps, MapStateToProps, useSelector} from 'react-redux'
import locale from '../../../../shared/locale'
import {getCommonLogins, getLoginTemplateId} from '../../../../shared/Redux/selectors'
import Add from '../../../../shared/svgMaker/add'
import Fill from '../../../../shared/svgMaker/fill'
import launchInputHelper, {
  closeInputHelper,
  showReviewSavedRecord,
  updateInputObserver,
} from '../../../misc_functions/elementHelpers/launchInputHelper'
import {fillField} from '../../iframeUtil'
import {promptAliases} from '../../redux/aliases'
import useDraggableHeader from '../hooks/useDraggableHeader'
import messaging from '../../../lib/messaging'
import {keyIsEnter} from '../../../../shared/a11y'
import {getTabRecordValues, getThisTabInfo} from '../../redux/getThisTabState'
import {createRecord} from '@shared/Records/record-types-utils'
import {MessagePrefixes} from '../../../../javascript/bg/src/messaging/enums'
import {ActionMessageHandlerNames} from '../../../../javascript/bg/src/messaging/actionMessageHandler/enums'
import getOriginAndPath from '../../../../shared/Misc/getOriginAndPath'
import {useFirstUpdate} from '../hooks/useFirstUpdate'
import {
  csProxyStoreContext,
  useCsStoreDispatch,
  useCsStoreSelector,
} from '../../redux/csProxyStoreContext'
import type {CsStore} from '../../../../javascript/bg/src/redux-cs/rootReducer'
import type {FillFieldMessageResponse} from '../../../message_handler/messages/fillField'
import {useRecordType} from '../hooks/useRecordType'

type PropsFromStore = {
  fillFieldData?: FillFieldMessageResponse
  recordValuesUsername: string
}

type LoginInputHelperProps = {
  lockId: string
  inputType?: string
}

const INSTRUCTIONS = locale.translateThis('ext_email_prompt', 'Create a login using an email below')
const ADD_LOGIN = locale.translateThis('add_login', 'Add Login')

const LoginInputHelper: React.FC<LoginInputHelperProps & PropsFromStore> = (props) => {
  const csDispatch = useCsStoreDispatch()
  const isFirstUpdate = useFirstUpdate()
  const {emails, logins} = useSelector(getCommonLogins)
  const {username: storedUsername} = useCsStoreSelector(getTabRecordValues)
  const tabInfo = useCsStoreSelector(getThisTabInfo)
  const tabURL: string = tabInfo?.url || ''
  const loginTemplateId = useSelector(getLoginTemplateId)
  const loginTemplate = useRecordType(loginTemplateId)

  // set draggable header width
  useDraggableHeader('logo')

  const rowClicked = async (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    const username = e.currentTarget.textContent
    if (!username || !loginTemplate) return

    // set in redux store
    csDispatch(promptAliases.setRecordValues({username}))

    // autofill the field
    fillField({
      lockId: props.lockId,
      fieldData: username,
      dataKey: 'login',
      record: createRecord(loginTemplate, {
        record_uid: '',
        title: '',
        username,
        password: '',
        url: tabURL || '',
      }),
    })
  }

  useEffect(() => {
    // hop to next field if it's a password
    if (props.fillFieldData && !isFirstUpdate) {
      const {lockId, inputBounds, inputType, frameSrc} = props.fillFieldData
      if (lockId && inputType == 'password' && inputBounds) {
        updateInputObserver(lockId, true, 'password')

        launchInputHelper({
          name: 'passwordHelper',
          lockId,
          inputType,
          inputBounds,
          frameSrc,
        })
      } else {
        closeInputHelper()
      }

      closeLoginPreview()
    }
  }, [props.fillFieldData?.timeFilled])

  const addLoginClicked = async () => {
    if (!loginTemplate) return

    const login = storedUsername || emails[0]
    const record = createRecord(loginTemplate, {
      record_uid: '',
      title: tabInfo?.title ?? '',
      username: login,
      password: '',
      url: getOriginAndPath(tabURL),
    })
    csDispatch(promptAliases.setUploadRecord(record))
    showReviewSavedRecord()
  }

  const showLogin = (email: string) => {
    const data = {
      lockId: props.lockId,
      valueField: email,
      rootDivId: 'keeper-hover-data-container',
      hoverKey: 'hover-data',
      isPassword: false,
    }
    messaging.sendMessage(ActionMessageHandlerNames.SHOW_PREVIEW, {
      type: MessagePrefixes.ACTION,
      data,
    })
  }

  const closeLoginPreview = () => {
    messaging.sendMessage(ActionMessageHandlerNames.CLOSE_HOVER_DATA, {
      type: MessagePrefixes.ACTION,
    })
  }

  // Effect to cleanup the possibility of an orphaned preview iFrame if we're
  // hopping to the password input helper (BE-4434)
  useEffect(() => {
    return closeLoginPreview
  })

  const values = props.inputType == 'email' ? emails : logins

  return (
    <div className="login-input-helper">
      <div className="login-input-helper-instruction">{INSTRUCTIONS}</div>
      <div className="login-input-helper-emails">
        {values.map((login, index) => {
          const emailContainerContents = (
            <>
              <span>{login}</span>
              <Fill width={24} height={24} />
            </>
          )

          const keeperDivProps: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
          > = {
            key: login,
            className: 'login-input-helper-email themed-hover focus-visible',
            tabIndex: 0,
            onKeyDown: async (e) => {
              if (keyIsEnter(e.code)) {
                await rowClicked(e)
              }
            },
            role: 'button',
            onClick: rowClicked,
            children: emailContainerContents,
          }

          keeperDivProps.onMouseEnter = () => {
            showLogin(login)
          }
          keeperDivProps.onMouseLeave = closeLoginPreview

          return React.createElement('div', keeperDivProps)
        })}
      </div>
      <div
        className="login-input-helper-add-login themed-background-light themed-text themed-svg focus-visible"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (keyIsEnter(e.code)) {
            addLoginClicked()
          }
        }}
        onClick={addLoginClicked}
      >
        <Add height={24} width={24} />
        {ADD_LOGIN}
      </div>
    </div>
  )
}

const mapStateToProps: MapStateToProps<PropsFromStore, {}, CsStore> = (state) => {
  return {
    recordValuesUsername: state.tab.recordValues.username,
    fillFieldData: state.tab.fillFieldValues,
  }
}

export default connect(mapStateToProps, null, null, {context: csProxyStoreContext})(
  LoginInputHelper
)
