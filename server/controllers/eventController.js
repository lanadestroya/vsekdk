const { Event } = require('../models/models');
const ApiError = require('../error/ApiError');

class EventController {
    async getAll(req, res) {
        try {
            const events = await Event.findAll();
            res.json(events);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getOne(req, res) {
        try {
            const event = await Event.findByPk(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });
            res.json(event);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const { title, text, date, price, pic } = req.body;
            
            // Проверяем наличие всех необходимых полей
            if (!title || !text || !date || !price || !pic) {
                return res.status(400).json({ 
                    message: 'Необходимо заполнить все поля',
                    received: { title, text, date, price, pic: pic ? 'present' : 'missing' }
                });
            }
    
            // Проверяем, что pic это валидный Base64
            if (!pic.startsWith('data:image/')) {
                return res.status(400).json({ 
                    message: 'Неверный формат изображения. Ожидается Base64'
                });
            }
    
            const newEvent = await Event.create({
                title,
                text,
                date,
                price: parseInt(price, 10),
                pic
            });
    
            res.status(201).json(newEvent);
        } catch (error) {
            console.error('Ошибка при создании события:', error);
            res.status(500).json({ 
                message: 'Ошибка при создании события',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const { title, text, date, price, pic } = req.body;
            const updateData = { title, text, date, price };
    
            if (pic) {
                if (!pic.startsWith('data:image/')) {
                    return res.status(400).json({ 
                        message: 'Неверный формат изображения. Ожидается Base64'
                    });
                }
                updateData.pic = pic;
            }
    
            const event = await Event.findByPk(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
    
            await event.update(updateData);
            res.json(event);
        } catch (error) {
            console.error('Ошибка при обновлении события:', error);
            res.status(500).json({ message: 'Ошибка при обновлении события' });
        }
    }

    async delete(req, res) {
        try {
            const event = await Event.findByPk(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            await event.destroy();
            res.json({ message: 'Event successfully deleted' });
        } catch (error) {
            console.error('Ошибка при удалении события:', error);
            res.status(500).json({ message: 'Ошибка при удалении события' });
        }
    }
}

module.exports = new EventController();
