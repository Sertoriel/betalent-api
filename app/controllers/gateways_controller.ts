import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'
import vine from '@vinejs/vine'

export default class GatewaysController {
  // GET /api/v1/gateways
  async index({ response }: HttpContext) {
    const gateways = await Gateway.query().orderBy('priority', 'asc')
    return response.ok(gateways)
  }

  // PATCH /api/v1/gateways/:id/toggle_active
  async toggleActive({ params, response }: HttpContext) {
    const gateway = await Gateway.findOrFail(params.id)
    gateway.isActive = !gateway.isActive
    await gateway.save()

    return response.ok({
      message: 'Status do Gateway atualizado com sucesso.',
      gateway,
    })
  }

  // PATCH /api/v1/gateways/:id/priority
  async updatePriority({ params, request, response }: HttpContext) {
    const schema = vine.object({
      priority: vine.number().min(1),
    })

    const payload = await request.validateUsing(vine.compile(schema))
    const gateway = await Gateway.findOrFail(params.id)

    // Se a prioridade solicitada já estiver em uso, empurramos as outras para baixo (swap logic simples ou downshift)
    const gatewayComMesmaPrioridade = await Gateway.query()
      .where('priority', payload.priority)
      .first()

    if (gatewayComMesmaPrioridade && gatewayComMesmaPrioridade.id !== gateway.id) {
      // Troca simples: o gateway que ocupava a vaga assume a prioridade antiga deste gateway
      gatewayComMesmaPrioridade.priority = gateway.priority
      await gatewayComMesmaPrioridade.save()
    }

    gateway.priority = payload.priority
    await gateway.save()

    return response.ok({
      message: 'Prioridade atualizada com sucesso.',
      gateway,
    })
  }
}
