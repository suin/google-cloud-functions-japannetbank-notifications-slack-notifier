import { IncomingWebhook, IncomingWebhookResult } from '@slack/webhook'
import { notificationFormatter } from './notificationFormatter'

const webhook: Pick<IncomingWebhook, 'send'> = process.env.WEBHOOK_URL
  ? new IncomingWebhook(process.env.WEBHOOK_URL)
  : {
      send: async () => {
        return {} as IncomingWebhookResult
      },
    }

describe('notificationFormatter', () => {
  it('automaticTransferRegistrationCreated', async () => {
    await webhook.send(
      notificationFormatter.automaticTransferRegistrationCreated({
        type: 'automaticTransferRegistrationCreated',
        name: 'オフィス賃料',
        transferDate: '月末日',
      }),
    )
  })
  it('automaticTransferRegistrationDeleted', async () => {
    await webhook.send(
      notificationFormatter.automaticTransferRegistrationDeleted({
        type: 'automaticTransferRegistrationDeleted',
        name: 'オフィス賃料',
        transferDate: '月末日',
      }),
    )
  })
  it('automaticTransferRegistrationUpdated', async () => {
    await webhook.send(
      notificationFormatter.automaticTransferRegistrationUpdated({
        type: 'automaticTransferRegistrationUpdated',
        name: 'オフィス賃料',
        transferDate: '月末日',
      }),
    )
  })
  it('bulkTransferFeeCharged', async () => {
    await webhook.send(
      notificationFormatter.bulkTransferFeeCharged({
        type: 'bulkTransferFeeCharged',
        chargeDate: '2020-06-25',
      }),
    )
  })
  it('bulkTransferUpcoming', async () => {
    await webhook.send(
      notificationFormatter.bulkTransferUpcoming({
        type: 'bulkTransferUpcoming',
        number: '200619-001',
        transferDate: '2020-06-25',
      }),
    )
  })
  it('payeasyPaid', async () => {
    await webhook.send(
      notificationFormatter.payeasyPaid({
        type: 'payeasyPaid',
        receiptNumber: '2020071002866599',
        paidOn: '2020-07-10T08:52:12+09:00',
        payee: '地方税共同機構',
        paymentNumber: '18020622256625',
        name: 'クラフトマンソフトウエア',
        detail: '住民特徴０２年０６月',
        amount: 132_600,
        fee: 0,
      }),
    )
  })
  it('timeDepositAutomaticallyRenewed', async () => {
    await webhook.send(
      notificationFormatter.timeDepositAutomaticallyRenewed({
        type: 'timeDepositAutomaticallyRenewed',
        number: '0143',
        renewalDate: '2020-07-01',
      }),
    )
  })
  it('timeDepositCreated', async () => {
    await webhook.send(
      notificationFormatter.timeDepositCreated({
        type: 'timeDepositCreated',
        number: '0143',
      }),
    )
  })
  it('timeDepositMatured', async () => {
    await webhook.send(
      notificationFormatter.timeDepositMatured({
        type: 'timeDepositMatured',
        number: '0143',
      }),
    )
  })
  it('timeDepositWillMature', async () => {
    await webhook.send(
      notificationFormatter.timeDepositWillMature({
        type: 'timeDepositWillMature',
        number: '0143',
        maturityDate: '2020-07-01',
      }),
    )
  })
  it('transferDeposited', async () => {
    await webhook.send(
      notificationFormatter.transferDeposited({
        type: 'transferDeposited',
        depositedOn: '2000-01-02T03:04:05+09:00',
      }),
    )
  })
  it('transferDestinationRegistered', async () => {
    await webhook.send(
      notificationFormatter.transferDestinationRegistered({
        type: 'transferDestinationRegistered',
        recipient: 'カ）クラフトマンソフトウエ．．',
        bank: '三菱ＵＦＪ銀行',
        registeredOn: '2000-01-02T03:04:05+09:00',
      }),
    )
  })
  it('transferWithdrawalLimitChanged', async () => {
    await webhook.send(
      notificationFormatter.transferWithdrawalLimitChanged({
        type: 'transferWithdrawalLimitChanged',
        changedOn: '2000-01-02T03:04:05+09:00',
      }),
    )
  })
  it('transferWithdrawalScheduled', async () => {
    await webhook.send(
      notificationFormatter.transferWithdrawalScheduled({
        type: 'transferWithdrawalScheduled',
        number: '202007080077840',
        amount: 134383,
        recipient: 'カ）クラフトマンソフトウエ．．',
        scheduledDate: '2020-01-02',
      }),
    )
  })
  it('transferWithdrawn', async () => {
    await webhook.send(
      notificationFormatter.transferWithdrawn({
        type: 'transferWithdrawn',
        withdrawnOn: '2000-01-02T03:04:05+09:00',
        number: '202007080077840',
        amount: 134383,
        recipient: 'カ）クラフトマンソフトウエ．．',
      }),
    )
  })
  it('visaFrozen', async () => {
    await webhook.send(
      notificationFormatter.visaFrozen({
        type: 'visaFrozen',
        frozenOn: '2000-01-02T03:04:05+09:00',
      }),
    )
  })
  it('visaLimitChanged', async () => {
    await webhook.send(
      notificationFormatter.visaLimitChanged({
        type: 'visaLimitChanged',
        changedOn: '2000-01-02T03:04:05+09:00',
        newLimit: 1000000,
      }),
    )
  })
  it('visaRefunded', async () => {
    await webhook.send(
      notificationFormatter.visaRefunded({
        type: 'visaRefunded',
        refundedOn: '2000-01-02T03:04:05+09:00',
        shop: 'ＡＭＡＺＯＮ　ＣＯ　ＪＰ',
        amount: 100000,
        number: '1A001001',
      }),
    )
  })
  describe('visaWithdrawn', () => {
    test('unit', () => {
      const message = notificationFormatter.visaWithdrawn({
        type: 'visaWithdrawn',
        withdrawnOn: '2000-01-01T12:00:00+09:00',
        shop: 'ＡＭＡＺＯＮ　ＣＯ　ＪＰ',
        amount: 100000,
        number: '1A001001',
      })
      const text = message.attachments?.[0]?.text
      expect(text).toContain('100,000 支払いました。')
      expect(text).toContain('2000年1月1日(土) 12:00')
    })
    test('integration', async () => {
      await webhook.send(
        notificationFormatter.visaWithdrawn({
          type: 'visaWithdrawn',
          withdrawnOn: '2000-01-02T03:04:05+09:00',
          shop: 'ＡＭＡＺＯＮ　ＣＯ　ＪＰ',
          amount: 100000,
          number: '1A001001',
        }),
      )
    })
  })
})
