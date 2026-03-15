import { GatewaySchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'

export default class Gateway extends GatewaySchema {
  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column()
  declare priority: number
}
