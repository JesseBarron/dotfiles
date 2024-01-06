import type {DomainTestBlockArray} from 'custom/javascript/bg/src/detection/test/testData/testDomains'
import {MessagePrefixes} from 'custom/javascript/bg/src/messaging/enums'
import {GetMessageHandlerNames} from 'custom/javascript/bg/src/messaging/getMessageHandler/enums'
import messaging from '../../content_scripts/lib/messaging'

export function getTestDomains(): Promise<DomainTestBlockArray> {
  return new Promise((resolve) => {
    messaging.sendMessage(
      GetMessageHandlerNames.GET_TEST_DOMAINS,
      {type: MessagePrefixes.GET},
      (response: DomainTestBlockArray) => {
        resolve(response)
      }
    )
  })
}
