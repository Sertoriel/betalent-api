import type {
  PaymentGatewayInterface,
  PaymentData,
  PaymentResponse,
} from './payment_gateway_interface.js'
import axios from 'axios'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export class GatewayOneService implements PaymentGatewayInterface {
  private baseURL = 'http://localhost:3001'

  private async getToken(): Promise<string> {
    const response = await axios.post(`${this.baseURL}/login`, {
      email: env.get('GATEWAY1_EMAIL'),
      token: env.get('GATEWAY1_TOKEN'),
    })
    return response.data.token
  }

  async processPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const token = await this.getToken()
      const response = await axios.post(`${this.baseURL}/transactions`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      logger.info('Gateway 1 aprovou o pagamento!')
      return { success: true, external_id: response.data.id }
    } catch (error: any) {
      logger.warn(`Erro no Gateway 1: ${error.message}`)
      return { success: false, error: 'Gateway 1 Error' }
    }
  }

  async refundPayment(externalId: string): Promise<PaymentResponse> {
    try {
      const token = await this.getToken()
      await axios.post(
        `${this.baseURL}/transactions/${externalId}/refund`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return { success: true }
    } catch (error: any) {
      logger.warn(`Erro de estorno no Gateway 1: ${error.message}`)
      return { success: false, error: 'Gateway 1 Error' }
    }
  }
}
