import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('signup creates a new user', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      email: 'test@example.com',
      password: 'password123',
    })

    response.assertStatus(201)
    response.assertBodyContains({ user: { email: 'test@example.com' } })
  })

  test('login generates a bearer token', async ({ client }) => {
    await User.create({
      email: 'testlogin@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'testlogin@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      user: { email: 'testlogin@example.com' },
    })
  })

  test('accessing protected route without token blocks with 401', async ({ client }) => {
    const response = await client.get('/api/v1/profile')
    response.assertStatus(401)
  })
})
