import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await User.all()
    return response.ok(users)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: 'Usuário não encontrado' })
    }
    return response.ok(user)
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: 'Usuário não encontrado' })
    }

    const payload = request.only(['role', 'email', 'password'])
    user.merge(payload)
    await user.save()

    return response.ok(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: 'Usuário não encontrado' })
    }

    await user.delete()
    return response.noContent()
  }
}
