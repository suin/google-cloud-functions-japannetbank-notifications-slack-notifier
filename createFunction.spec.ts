import {
  IncomingWebhookResult,
  IncomingWebhookSendArguments,
} from '@slack/webhook'
import { EventData } from '@suin/event-data'
import { PubSubFunction } from '@suin/google-cloud-typed-pubsub-function'
import { createFunction, Data, Dependencies, Logger } from './createFunction'

describe('createFunction', () => {
  const mutedLogger: Logger = {
    info: () => {},
    error: () => {},
  }
  let sentMessages: any[] = []
  const webhookStub: Dependencies['webhook'] = {
    async send(
      message: string | IncomingWebhookSendArguments,
    ): Promise<IncomingWebhookResult> {
      sentMessages.push(message)
      return { text: '' }
    },
  }
  const sendJapannetbankNotificationToSlack = createFunction({
    webhook: webhookStub,
    logger: mutedLogger,
  })
  const dummyContext = {
    timestamp: '',
    eventId: '',
    eventType: '',
  }

  beforeEach(() => {
    sentMessages = []
  })

  it('send notification', async () => {
    await sendJapannetbankNotificationToSlack(
      createValidEvent({
        correlationId: 'dummy',
        data: {
          email: {
            to: [],
            cc: [],
            replyTo: [],
            subject: '',
            from: [],
            bodyText: '',
          },
          notification: {
            type: 'visaWithdrawn',
            withdrawnOn: '2001-02-03T04:05:06+09:00',
            amount: 2760,
            shop: 'ＡＭＡＺＯＮ　ＣＯ　ＪＰ',
            number: '1A165002',
          },
        },
      }),
      dummyContext,
    )
    expect(sentMessages).toEqual([
      {
        attachments: [
          {
            color: 'warning',
            text: `:VISA: <https://www.google.com/search?q=%EF%BC%A1%EF%BC%AD%EF%BC%A1%EF%BC%BA%EF%BC%AF%EF%BC%AE%E3%80%80%EF%BC%A3%EF%BC%AF%E3%80%80%EF%BC%AA%EF%BC%B0|AMAZON CO JP>に ¥2,760 支払いました。
*引落日時* 2001年2月3日(土) 04:05
*明細番号* 1A165002`,
          },
        ],
      },
    ])
  })

  it('send notification2', async () => {
    await sendJapannetbankNotificationToSlack(
      createValidEvent({
        correlationId: 'dummy',
        data: {
          email: {
            to: [],
            cc: [],
            replyTo: [],
            subject: '未知のお知らせ',
            from: [],
            bodyText: '',
          },
        },
      }),
      dummyContext,
    )
    expect(sentMessages).toEqual([
      { attachments: [{ text: '未知のお知らせ' }] },
    ])
  })
})

const createValidEvent = (
  data: EventData<Data>,
): Parameters<PubSubFunction>[0] => {
  return {
    data: Buffer.from(JSON.stringify(data)).toString('base64'),
    attributes: null,
  }
}
