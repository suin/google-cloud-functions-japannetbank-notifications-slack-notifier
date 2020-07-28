import { IncomingWebhook } from '@slack/webhook'
import { PubSubFunction } from '@suin/google-cloud-typed-pubsub-function'
import { createFunction } from './createFunction'

const webhookUrl = process.env.WEBHOOK_URL

if (typeof webhookUrl !== 'string') {
  throw new Error(`Env WEBHOOK_URL is required`)
}

export const sendJapannetbankNotificationToSlack: PubSubFunction = createFunction(
  {
    webhook: new IncomingWebhook(webhookUrl),
  },
)
