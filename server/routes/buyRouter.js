const Router = require('express')
const router = new Router()
const buyController = require('../controllers/buyController')


router.post('/', buyController.create)
router.get('/', buyController.getAll)
router.get('/', buyController.getOne)


module.exports = router