import Gateway from '#models/gateway'
import { GatewayOneService } from './gateway_one_service.js'
import { GatewayTwoService } from './gateway_two_service.js'
import type { PaymentData } from './payment_gateway_interface.js'
import logger from '@adonisjs/core/services/logger'

export class PaymentManager {
  async processMultiGateway(
    data: PaymentData
  ): Promise<{ success: boolean; gatewayId?: number; externalId?: string }> {
    const activeGateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

    logger.info(`Gateways encontrados no banco: ${activeGateways.length}`)

    for (const gw of activeGateways) {
      logger.info(`Tentando pagar com: "${gw.name}" (Prioridade: ${gw.priority})`)

      const service = this.resolveGatewayService(gw.name)

      if (!service) {
        logger.warn(`Não achou serviço para o nome "${gw.name}". Ele foi pulado!`)
        continue
      }

      const response = await service.processPayment(data)

      if (response.success) {
        return { success: true, gatewayId: gw.id, externalId: response.external_id }
      } else {
        logger.warn(`"${gw.name}" recusou o pagamento. Pulando para o próximo da fila...`)
      }
    }

    logger.error('Fim da fila. Todos falharam ou não há gateways suficientes.')
    return { success: false }
  }

  private resolveGatewayService(name: string) {
    if (name === 'Gateway 1') return new GatewayOneService()
    if (name === 'Gateway 2') return new GatewayTwoService()
    return null
  }

  async processRefund(
    gatewayId: number,
    externalId: string
  ): Promise<{ success: boolean; error?: string }> {
    const gateway = await Gateway.find(gatewayId)

    if (!gateway) {
      return { success: false, error: 'Gateway original não encontrado.' }
    }

    logger.info(`Solicitando estorno no: "${gateway.name}"`)
    const service = this.resolveGatewayService(gateway.name)

    if (!service) {
      return { success: false, error: 'Serviço do gateway não implementado.' }
    }

    const response = await service.refundPayment(externalId)

    if (response.success) {
      logger.info(`Estorno aprovado pelo ${gateway.name}!`)
      return { success: true }
    }

    return { success: false, error: response.error }
  }
}
