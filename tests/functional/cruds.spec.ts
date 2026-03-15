import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'

test.group('CRUDs & Listagens', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let currentUser: User

  group.each.setup(async () => {
    currentUser = await User.create({
      email: 'crud@test.com',
      password: 'secretpassword',
      role: 'user',
    })
  })

  test('guests cannot access private products route', async ({ client }) => {
    const response = await client.get('/api/v1/products')
    response.assertStatus(401)
  })

  test('authenticated users can list clients and preload their transactions', async ({
    assert,
    client,
  }) => {
    const clientDB = await Client.create({ name: 'John Doe', email: 'john@test.com' })
    const product = await Product.create({ name: 'Mouse', amount: 50, value: 990 })

    await Transaction.create({
      clientId: clientDB.id,
      productId: product.id,
      quantity: 2,
      amount: 1980,
      cardLastNumbers: '9999',
      status: 'approved',
    })

    const response = await client.get(`/api/v1/clients/${clientDB.id}`).loginAs(currentUser)

    response.assertStatus(200)

    // A resposta deve vir com o field \`transactions\` em loop devido ao \`@hasMany().preload()\`
    assert.properties(response.body(), ['id', 'name', 'email', 'transactions'])
    assert.lengthOf(response.body().transactions, 1)
    assert.equal(response.body().transactions[0].productId, product.id)
  })
})
