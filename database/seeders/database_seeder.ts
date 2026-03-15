import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'
import Product from '#models/product'

export default class extends BaseSeeder {
  async run() {
    // 1. Cadastra os dois gateways
    await Gateway.createMany([
      { name: 'Gateway 1', isActive: true, priority: 1 },
      { name: 'Gateway 2', isActive: true, priority: 2 },
    ])

    // 2. Cadastra o produto (Teclado Mecânico)
    await Product.create({
      name: 'Teclado Mecânico',
      value: 25000, // Preço
      amount: 50, // Quantidade fictícia em estoque
    })
  }
}
