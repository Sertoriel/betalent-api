export interface PaymentGatewayInterface {
  processPayment(data: PaymentData): Promise<PaymentResponse>
  refundPayment(externalId: string): Promise<PaymentResponse>
}

export type PaymentData = {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export type PaymentResponse = {
  success: boolean
  external_id?: string
  error?: string
}
