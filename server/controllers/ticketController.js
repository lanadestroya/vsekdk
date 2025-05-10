const { Ticket, Event } = require('../models/models');

// Создание нового билета
exports.createTicket = async (req, res) => {
    try {
        const { eventId, name, email, phone, quantity } = req.body;
        const userId = req.user.id;

        // Проверяем существование мероприятия
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Мероприятие не найдено' });
        }

        // Создаем билеты
        const tickets = [];
        for (let i = 0; i < quantity; i++) {
            const ticket = await Ticket.create({
                eventId,
                userId,
                name,
                email,
                phone,
                status: 'active'
            });
            tickets.push(ticket);
        }

        res.status(201).json({
            message: 'Билеты успешно созданы',
            ticketId: tickets[0].id
        });
    } catch (error) {
        console.error('Ошибка при создании билета:', error);
        res.status(500).json({ message: 'Ошибка при создании билета' });
    }
};

// Получение всех билетов пользователя
exports.getUserTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await Ticket.findAll({
            where: { userId },
            include: [{
                model: Event,
                attributes: ['title', 'date']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error('Ошибка при получении билетов:', error);
        res.status(500).json({ message: 'Ошибка при получении билетов' });
    }
};

// Получение информации о конкретном билете
exports.getTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user.id;

        const ticket = await Ticket.findOne({
            where: { id: ticketId, userId },
            include: [{
                model: Event,
                attributes: ['title', 'date', 'text']
            }]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Билет не найден' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Ошибка при получении информации о билете:', error);
        res.status(500).json({ message: 'Ошибка при получении информации о билете' });
    }
};

// Отмена билета
exports.cancelTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const userId = req.user.id;

        const ticket = await Ticket.findOne({
            where: { id: ticketId, userId }
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Билет не найден' });
        }

        if (ticket.status === 'cancelled') {
            return res.status(400).json({ message: 'Билет уже отменен' });
        }

        await ticket.update({ status: 'cancelled' });

        res.json({ message: 'Билет успешно отменен' });
    } catch (error) {
        console.error('Ошибка при отмене билета:', error);
        res.status(500).json({ message: 'Ошибка при отмене билета' });
    }
}; 