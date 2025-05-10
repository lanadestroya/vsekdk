const { Buy, User, Event } = require('../models/models');
const ApiError = require('../error/ApiError');

class BuyController {
    async getAll(req, res) {
        try {
            const buys = await Buy.findAll({
                include: [
                    { model: User, attributes: ['login'] },
                    { model: Event, attributes: ['name', 'date', 'price'] }
                ]
            });
            res.json(buys);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getOne(req, res) {
        try {
            const buy = await Buy.findByPk(req.params.id, {
                include: [
                    { model: User, attributes: ['login'] },
                    { model: Event, attributes: ['name', 'date', 'price'] }
                ]
            });
            if (!buy) return res.status(404).json({ message: 'Purchase not found' });
            res.json(buy);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const { eventID, email } = req.body;
            
            // Находим пользователя по email
            const user = await User.findOne({ where: { login: email } });
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            // Проверяем существование мероприятия
            const event = await Event.findByPk(eventID);
            if (!event) {
                return res.status(404).json({ message: 'Мероприятие не найдено' });
            }

            // Создаем запись о покупке
            const newBuy = await Buy.create({
                clientID: user.id,
                eventID: eventID
            });

            res.status(201).json({
                message: 'Билет успешно куплен',
                buy: newBuy
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new BuyController();
