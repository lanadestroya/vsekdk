const Router = require('express')
const router = new Router()
const rolesController = require('../controllers/rolesController')


router.get('/', rolesController.getAll)


module.exports = router