import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Product from '#models/product'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'

test.group('Refunds', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let adminUser: User
  let transactionDB: Transaction
  let gtw: Gateway

  group.each.setup(async () => {
    adminUser = await User.create({ email: 'admin@test.com', password: 'secure123', role: 'admin' })
    gtw = await Gateway.updateOrCreate({ name: 'Gateway 1' }, { priority: 1, isActive: true })

    const clientDB = await Client.create({ name: 'Bob', email: 'bob@test.com' })
    const product = await Product.create({ name: 'Keyboard', amount: 10, value: 5000 })

    transactionDB = await Transaction.create({
      clientId: clientDB.id,
      productId: product.id,
      quantity: 1,
      amount: 5000,
      cardLastNumbers: '5678',
      gatewayId: gtw.id,
      externalId: 'fake-ext-id-1234',
      status: 'approved',
    })
  })

  test('admin successfully refunds a transaction linking to mock Gateway 1', async ({
    client,
    assert,
  }) => {
    const response = await client
      .post(`/api/v1/transactions/${transactionDB.id}/refund`)
      .loginAs(adminUser)

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Reembolso processado com sucesso!' })

    // Validate DB change
    await transactionDB.refresh()
    assert.equal(transactionDB.status, 'refunded')
  })

  test('cannot refund an already refunded transaction', async ({ client }) => {
    transactionDB.status = 'refunded'
    await transactionDB.save()

    const response = await client
      .post(`/api/v1/transactions/${transactionDB.id}/refund`)
      .loginAs(adminUser)

    response.assertStatus(400)
    response.assertBodyContains({ error: 'Esta transação já foi reembolsada.' })
  })
})
