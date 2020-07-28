import { IncomingWebhookSendArguments } from '@slack/webhook'
import { JapannetbankNotification } from '@suin/japannetbank-email-parser'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import moji from 'moji'

type NotificationFormatter = {
  readonly [K in JapannetbankNotification['type']]?: (
    notification: Extract<JapannetbankNotification, { type: K }>,
  ) => IncomingWebhookSendArguments
}

const loginUrl = 'https://login.japannetbank.co.jp/wctx/BALoginAction.do'

export const notificationFormatter: NotificationFormatter = {
  automaticTransferRegistrationCreated: ({ name, transferDate }) =>
    newMessage(
      'info',
      '自動振込サービスを登録しました。',
      ['振込名称', name],
      ['振込指定日', transferDate],
    ),
  automaticTransferRegistrationDeleted: ({ name, transferDate }) =>
    newMessage(
      'info',
      '自動振込サービスの登録を削除しました。',
      ['振込名称', name],
      ['振込指定日', transferDate],
    ),
  automaticTransferRegistrationUpdated: ({ name, transferDate }) =>
    newMessage(
      'info',
      `自動振込サービスの登録内容を変更しました。`,
      ['振込名称', name],
      ['振込指定日', transferDate],
    ),
  bulkTransferCompleted: ({ number, transferDate }) =>
    newMessage(
      'warning',
      `:WEB総振: WEB総振を実施しました。`,
      ['振込日', date(transferDate)],
      ['受付番号', number],
    ),
  bulkTransferFeeCharged: ({ chargeDate }) =>
    newMessage('warning', ':WEB総振: WEB総振手数料を支払いました。', [
      '手数料引落日',
      date(chargeDate),
    ]),
  bulkTransferUpcoming: ({ number, transferDate }) =>
    newMessage(
      'info',
      `:WEB総振: まもなくWEB総振を実施します。`,
      ['振込指定日', date(transferDate)],
      ['受付番号', number],
    ),
  payeasyPaid: ({
    receiptNumber,
    paidOn,
    payee,
    customerNumber,
    paymentNumber,
    name,
    detail,
    amount,
    fee,
  }) =>
    newMessage(
      'warning',
      `:ペイジー: <${google(payee)}|${payee}>に ${jpy(amount)} 支払いました。`,
      ['払込内容', detail],
      ['払込日時', datetime(paidOn)],
      ['受付番号', receiptNumber],
      ['お客さま番号', customerNumber],
      ['納付番号', paymentNumber],
      ['お名前', name],
      ['払込手数料', jpy(fee)],
    ),
  timeDepositAutomaticallyRenewed: ({ number, renewalDate }) =>
    newMessage(
      'info',
      `:定期預金: 定期預金を自動継続しました。`,
      ['定期契約番号', number],
      ['継続日', date(renewalDate)],
    ),
  timeDepositCreated: ({ number }) =>
    newMessage('info', `:定期預金: 定期預金の新約を作成しました。`, [
      '定期契約番号',
      number,
    ]),
  timeDepositMatured: ({ number }) =>
    newMessage('info', `:定期預金: 定期預金が満期を迎えました。`, [
      '定期契約番号',
      number,
    ]),
  timeDepositWillMature: ({ number, maturityDate }) =>
    newMessage(
      'info',
      `:定期預金: 定期預金がまもなく満期になります。`,
      ['定期契約番号', number],
      ['満期日', date(maturityDate)],
    ),
  transferDeposited: ({ depositedOn }) =>
    newMessage(
      'warning',
      `:振込: 誰かへの振込を行いました。<${loginUrl}|ログインして確認する>`,
      ['振込日時', datetime(depositedOn)],
    ),
  transferDestinationRegistered: ({ recipient, bank }) =>
    newMessage(
      'info',
      ':振込: 振込先口座を登録しました。',
      ['受取人名', mask(recipient)],
      ['銀行名', bank],
    ),
  transferWithdrawalLimitChanged: () =>
    newMessage(
      'danger',
      ':振込: *振込限度額を変更しました。* <${loginUrl}|ログインして確認する>',
    ),
  transferWithdrawalScheduled: ({ recipient, amount, number, scheduledDate }) =>
    newMessage(
      'info',
      `:振込: ${mask(recipient)}への ${jpy(amount)} の振込を予約しました。`,
      ['受付番号', number],
      ['振込予定日', date(scheduledDate)],
    ),
  transferWithdrawn: ({ recipient, amount, number, withdrawnOn }) =>
    newMessage(
      'warning',
      `:振込: ${mask(recipient)}に ${jpy(amount)} 振り込みました。`,
      ['受付番号', number],
      ['振込日時', datetime(withdrawnOn)],
    ),
  visaFrozen: () =>
    newMessage(
      'danger',
      `:VISA: :fire: *何らかの問題により、VISAデビットカードを利用停止しました。* <${loginUrl}|ログインして利用停止を解除する>`,
    ),
  visaLimitChanged: ({ newLimit }) =>
    newMessage(
      'danger',
      `:VISA: ご利用限度額を ${jpy(newLimit)} に変更しました。`,
    ),
  visaRefunded: ({ refundedOn, shop, amount, number }) =>
    newMessage(
      'success',
      `:VISA: <${google(shop)}|${half(shop)}>から ${jpy(
        amount,
      )} の返金が来ました。`,
      ['返金日時', datetime(refundedOn)],
      ['明細番号', number],
    ),
  visaWithdrawn: ({ withdrawnOn, useOfDate, shop, amount, number }) =>
    newMessage(
      'warning',
      `:VISA: <${google(shop)}|${half(shop)}>に ${jpy(amount)} 支払いました。`,
      ['引落日時', datetime(withdrawnOn)],
      ['ご利用日', useOfDate && date(useOfDate)],
      ['明細番号', number],
    ),
}

const newMessage = (
  severity: 'info' | 'warning' | 'success' | 'danger',
  message: string,
  ...fields: ReadonlyArray<[string, string | undefined]>
): IncomingWebhookSendArguments => {
  return {
    attachments: [
      {
        color:
          severity === 'info'
            ? '#2196F3'
            : severity === 'success'
            ? 'good'
            : severity,
        text: [
          message,
          ...fields.flatMap(([key, value]) => {
            return typeof value === 'string' ? [`*${key}* ${value}`] : []
          }),
        ].join('\n'),
      },
    ],
  }
}

const datetime = (isoDate: string): string =>
  format(parseISO(isoDate), 'yyyy年M月d日(EEEEE) hh:mm', { locale: ja })

const date = (isoDate: string): string =>
  format(parseISO(isoDate), 'yyyy年M月d日(EEEEE)', { locale: ja })

const google = (q: string): string =>
  'https://www.google.com/search?q=' + encodeURIComponent(q)

const jpy = (number: number): string =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(
    number,
  )

const half = (value: string): string =>
  moji(value).convert('ZE', 'HE').convert('ZS', 'HS').toString()

const mask = (value: string): string => value.replace(/．/g, '█')
