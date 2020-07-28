import { IncomingWebhook } from '@slack/webhook'
import { EmailData, isEmailData } from '@suin/email-data'
import { parseEventData } from '@suin/event-data'
import type { PubSubFunction } from '@suin/google-cloud-typed-pubsub-function'
import { JapannetbankNotification } from '@suin/japannetbank-email-parser'
import { notificationFormatter } from './notificationFormatter'

export const createFunction = ({
  webhook,
  logger = defaultLogger,
}: Dependencies): PubSubFunction => async event => {
  const incomingEvent = parseEventData(
    JSON.parse(Buffer.from(event.data, 'base64').toString('utf-8')),
  )
  logger.info('Received an event', { incomingEvent })
  const { notification, email } = incomingEvent.data as Data // todo: parse

  // Notifies a message
  if (notification && notificationFormatter[notification.type]) {
    logger.info('Notification formatting available')
    const message = notificationFormatter[notification.type]!(
      notification as any,
    )
    await webhook.send(message)
    logger.info('Sent a message to slack', {
      correlationId: incomingEvent.correlationId,
      message,
    })
    return
  }

  // Fallback operation
  if (isEmailData(email)) {
    logger.info('Notification formatting unavailable')
    const message = {
      attachments: [{ text: email.subject! }],
    }
    await webhook.send(message)
    logger.info('Sent a message to slack', {
      correlationId: incomingEvent.correlationId,
      message,
    })
    return
  }
  logger.info('Something wrong')
}

const defaultLogger: Logger = {
  error(message: string, meta?: unknown): void {
    console.error(JSON.stringify({ message, meta }))
  },
  info(message: string, meta?: unknown): void {
    console.info(JSON.stringify({ message, meta }))
  },
}

export type Dependencies = {
  readonly webhook: Pick<IncomingWebhook, 'send'>
  readonly logger?: Logger
}

export type Logger = Pick<Console, 'info' | 'error'>

export type Data = {
  readonly notification?: JapannetbankNotification
  readonly email: EmailData
}
