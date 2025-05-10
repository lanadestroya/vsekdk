const Router = require('express')
const router = new Router()
const eventRouter = require('./eventRoutes')
const ticketRouter = require('./ticketRoutes')
const userRouter = require('./userRouter')
const rolesRouter = require('./rolesRouter')
const clientsRouter = require('./clientsRouter')
const buyRouter = require('./buyRouter')

router.get('/', (req, res) => {
    res.json({message: 'Сервер работает'})
})

router.use('/user', userRouter)
router.use('/event', eventRouter)
router.use('/ticket', ticketRouter)
router.use('/roles', rolesRouter)
router.use('/clients', clientsRouter)
router.use('/buy', buyRouter)

module.exports = router