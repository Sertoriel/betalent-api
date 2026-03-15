import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import { PaymentManager } from '../services/gateways/payment_manager.js'
import vine from '@vinejs/vine'

export default class CheckoutController {
  async store({ request, response }: HttpContext) {
    const schema = vine.object({
      client_name: vine.string(),
      client_email: vine.string().email(),
      product_id: vine.number(),
      quantity: vine.number().min(1),
      card_number: vine.string().fixedLength(16),
      cvv: vine.string().fixedLength(3),
    })

    const payload = await request.validateUsing(vine.compile(schema))

    const product = await Product.findOrFail(payload.product_id)
    const totalAmount = product.value * payload.quantity

    const client = await Client.firstOrCreate(
      { email: payload.client_email },
      { name: payload.client_name }
    )

    const manager = new PaymentManager()
    const paymentResult = await manager.processMultiGateway({
      amount: totalAmount,
      name: payload.client_name,
      email: payload.client_email,
      cardNumber: payload.card_number,
      cvv: payload.cvv,
    })

    if (!paymentResult.success) {
      return response
        .status(400)
        .send({ error: 'Pagamento recusado em todos os gateways disponíveis.' })
    }

    const transaction = await Transaction.create({
      clientId: client.id,
      gatewayId: paymentResult.gatewayId,
      externalId: paymentResult.externalId,
      status: 'success',
      amount: totalAmount,
      productId: product.id,
      quantity: payload.quantity,
      cardLastNumbers: payload.card_number.slice(-4),
    })

    return response.status(201).send(transaction)
  }
}
