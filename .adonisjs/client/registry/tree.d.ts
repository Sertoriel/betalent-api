/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  checkout: {
    store: typeof routes['checkout.store']
  }
  profile: {
    show: typeof routes['profile.show']
  }
  gateways: {
    index: typeof routes['gateways.index']
    toggleActive: typeof routes['gateways.toggle_active']
    updatePriority: typeof routes['gateways.update_priority']
  }
  refunds: {
    store: typeof routes['refunds.store']
  }
  users: {
    index: typeof routes['users.index']
    show: typeof routes['users.show']
    update: typeof routes['users.update']
    destroy: typeof routes['users.destroy']
  }
  products: {
    index: typeof routes['products.index']
    store: typeof routes['products.store']
    show: typeof routes['products.show']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
  }
  clients: {
    index: typeof routes['clients.index']
    show: typeof routes['clients.show']
  }
  transactions: {
    index: typeof routes['transactions.index']
    show: typeof routes['transactions.show']
  }
}
