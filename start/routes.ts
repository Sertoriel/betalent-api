import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const CheckoutController = () => import('../app/controllers/checkouts_controller.ts')
const GatewaysController = () => import('../app/controllers/gateways_controller.ts')
const RefundsController = () => import('../app/controllers/refunds_controller.ts')

const UsersController = () => import('../app/controllers/users_controller.ts')
const ProductsController = () => import('../app/controllers/products_controller.ts')
const ClientsController = () => import('../app/controllers/clients_controller.ts')
const TransactionsController = () => import('../app/controllers/transactions_controller.ts')

router
  .group(() => {
    // --- Rotas Públicas ---
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router.post('checkout', [CheckoutController, 'store'])

    // --- Rotas Privadas (middleware: auth) ---
    router
      .group(() => {
        // Rotas de Conta/Perfil
        router.get('/profile', [controllers.Profile, 'show'])

        // Rotas de Gerenciamento de Gateways
        router.get('/gateways', [GatewaysController, 'index'])
        router.patch('/gateways/:id/toggle_active', [GatewaysController, 'toggleActive'])
        router.patch('/gateways/:id/priority', [GatewaysController, 'updatePriority'])

        // Estorno / Chargeback
        router.post('/transactions/:id/refund', [RefundsController, 'store'])

        // CRUD Básicos Nível 2
        router.resource('users', UsersController).apiOnly().except(['store'])
        router.resource('products', ProductsController).apiOnly()
        router.resource('clients', ClientsController).apiOnly().only(['index', 'show'])
        router.resource('transactions', TransactionsController).apiOnly().only(['index', 'show'])
      })
      // prefix account foi removido para poder agrupar rotas de naturezas diferentes na mesma block privada ou as organizamos melhor. (Removido o .prefix('account') que abraçava o auth)
      .use(middleware.auth())
  })
  .prefix('/api/v1')
