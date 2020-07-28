#!/usr/bin/env bash
set -eux

declare TOPIC='japannetbankNotification'
declare WEBHOOK_URL='https://hooks.slack.com/...'

# Create the topic if not exists
gcloud pubsub topics describe ${TOPIC} > /dev/null || {
    gcloud pubsub topics create ${TOPIC}
}

# Deploy the function
gcloud functions deploy sendJapannetbankNotificationToSlack \
    --runtime nodejs12 \
    --trigger-topic ${TOPIC} \
    --set-env-vars WEBHOOK_URL=${WEBHOOK_URL}
