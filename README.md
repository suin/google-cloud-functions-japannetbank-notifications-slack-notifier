# @suin/google-cloud-functions-japannetbank-notifications-slack-notifier

この Google Cloud Function はジャパンネット銀行の通知を Slack に送信します。

## アーキテクチャ

TBD

## セットアップ

### GCP にデプロイする

デプロイするには[./deploy.sh](./deploy.sh)を実行してください。トピック名のカスタマイズが必要な場合は、このファイルを変更してください。

```bash
./deploy.sh
```

## 動作テスト

このパッケージ単体での動作確認は、次の手順で行うことができます。

```bash
# 通知データを入れる
gcloud pubsub topics publish 'japannetbankNotification' --message '{
 "correlationId": "dummy",
 "data": {
   "email": {
     "to": [],
     "cc": [],
     "replyTo": [],
     "subject": "",
     "from": [],
     "bodyText": ""
   },
   "notification": {
     "type": "visaWithdrawn",
     "withdrawnOn": "2001-02-03T04:05:06+09:00",
     "amount": 2760,
     "shop": "ＡＭＡＺＯＮ　ＣＯ　ＪＰ",
     "number": "1A165002"
   }
 }
}'
```
