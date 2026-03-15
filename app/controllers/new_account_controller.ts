import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class NewAccountController {
  async store({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(signupValidator)

    const user = await User.create({ email, password })
    const token = await User.accessTokens.create(user)

    return response.created({
      user: new UserTransformer(user).toObject(),
      token: token.value!.release(),
    })
  }
}
