import type {
  PaymentGatewayInterface,
  PaymentData,
  PaymentResponse,
} from './payment_gateway_interface.js'
import axios from 'axios'
import logger from '@adonisjs/core/services/logger'

export class GatewayTwoService implements PaymentGatewayInterface {
  private baseURL = 'http://localhost:3002'

  async processPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      logger.info('Tentando no Gateway 2...')

      const payload = {
        valor: data.amount,
        nome: data.name,
        email: data.email,
        numeroCartao: data.cardNumber,
        cvv: data.cvv,
      }

      const response = await axios.post(`${this.baseURL}/transacoes`, payload, {
        headers: {
          'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
          'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
        },
      })

      logger.info('Gateway 2 aprovou o pagamento!')
      return { success: true, external_id: response.data.id }
    } catch (error: any) {
      logger.warn(`Erro no Gateway 2: ${error.message}`)
      return { success: false, error: 'Gateway 2 Error' }
    }
  }

  async refundPayment(externalId: string): Promise<PaymentResponse> {
    try {
      await axios.post(
        `${this.baseURL}/transacoes/${externalId}/refund`,
        {},
        {
          headers: {
            'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
            'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
          },
        }
      )
      return { success: true }
    } catch (error: any) {
      logger.warn(`Erro de estorno no Gateway 2: ${error.message}`)
      return { success: false, error: 'Gateway 2 Error' }
    }
  }
}
