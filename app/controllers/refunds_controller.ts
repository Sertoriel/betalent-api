import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import { PaymentManager } from '../services/gateways/payment_manager.js'

export default class RefundsController {
  async store({ params, response }: HttpContext) {
    const transactionId = params.id
    const transaction = await Transaction.find(transactionId)

    if (!transaction) {
      return response.notFound({ error: 'Transação não encontrada.' })
    }

    if (transaction.status === 'refunded') {
      return response.badRequest({ error: 'Esta transação já foi reembolsada.' })
    }

    if (!transaction.gatewayId || !transaction.externalId) {
      return response.badRequest({
        error: 'Transação inválida. Não possui vínculo com um Gateway externo.',
      })
    }

    const manager = new PaymentManager()
    const refundResult = await manager.processRefund(transaction.gatewayId, transaction.externalId)

    if (!refundResult.success) {
      return response.badRequest({
        error: 'Falha ao processar o reembolso no Gateway original.',
        details: refundResult.error,
      })
    }

    transaction.status = 'refunded'
    await transaction.save()

    return response.ok({
      message: 'Reembolso processado com sucesso!',
      transaction,
    })
  }
}
