import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Product from '#models/product'
import Client from '#models/client'
import Gateway from '#models/gateway'

test.group('Checkout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let product: Product
  let clientDB: Client

  group.each.setup(async () => {
    // Preparando o banco de testes com dados Mock base
    clientDB = await Client.create({ name: 'Test Client', email: 'test@test.com' })
    product = await Product.create({ name: 'Produto Teste', amount: 10, value: 500 }) // R$ 5,00

    // Garantir que Gateways tem as prioridades puras.
    await Gateway.updateOrCreate({ name: 'Gateway 1' }, { priority: 1, isActive: true })
    await Gateway.updateOrCreate({ name: 'Gateway 2' }, { priority: 2, isActive: true })
  })

  test('compra de 1 produto com sucesso via Gateway 1', async ({ client }) => {
    const response = await client.post('/api/v1/checkout').json({
      product_id: product.id,
      quantity: 2,
      client_name: clientDB.name,
      client_email: clientDB.email,
      card_number: '1234567812345678',
      cvv: '123',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      productId: product.id,
      quantity: 2,
      status: 'success',
    })
  })

  test('compra sofre fallback e é aprovada no Gateway 2 se GTV 1 desativado', async ({
    client,
  }) => {
    // Desativa o Gateway 1 forçadamente na branch de fallback
    const gtw1 = await Gateway.findBy('name', 'Gateway 1')
    if (gtw1) {
      gtw1.isActive = false
      await gtw1.save()
    }

    const response = await client.post('/api/v1/checkout').json({
      product_id: product.id,
      quantity: 1,
      client_name: clientDB.name,
      client_email: clientDB.email,
      card_number: '1234567812345678',
      cvv: '123',
    })

    response.assertStatus(201)
    // Se o Mock Gtw 2 funcionar, ele vai retornar success também.
    response.assertBodyContains({
      status: 'success',
    })
  })
})
