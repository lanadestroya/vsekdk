const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/authMiddleware');

// Создание нового билета
router.post('/', auth, ticketController.createTicket);

// Получение всех билетов пользователя
router.get('/user', auth, ticketController.getUserTickets);

// Получение информации о конкретном билете
router.get('/:id', auth, ticketController.getTicket);

// Отмена билета
router.put('/:id/cancel', auth, ticketController.cancelTicket);

module.exports = router; 