import { TransactionSchema } from '#database/schema'
import { column, belongsTo } from '@adonisjs/lucid/orm'
import Product from '#models/product'
import Client from '#models/client'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Transaction extends TransactionSchema {
  @column()
  declare clientId: number

  @column({ columnName: 'product_id' })
  declare productId: number

  @column()
  declare quantity: number

  @column()
  declare amount: number

  @column()
  declare cardLastNumbers: string

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>
}
