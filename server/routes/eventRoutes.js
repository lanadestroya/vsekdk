const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/admin');

// Публичные маршруты
router.get('/', eventController.getAll);
router.get('/:id', eventController.getOne);

// Защищенные маршруты (только для администраторов)
router.post('/', [auth, admin], eventController.create);
router.put('/:id', [auth, admin], eventController.update);
router.delete('/:id', [auth, admin], eventController.delete);

module.exports = router; 