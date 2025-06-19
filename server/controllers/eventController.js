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
            const { title, text, date, price } = req.body;
            
            // Проверяем наличие всех необходимых полей
            if (!title || !text || !date || !price) {
                return res.status(400).json({ 
                    message: 'Необходимо заполнить все поля',
                    received: { title, text, date, price }
                });
            }
    
            // Проверяем наличие файла изображения
            if (!req.files || !req.files.image) {
                return res.status(400).json({ 
                    message: 'Необходимо загрузить изображение'
                });
            }
    
            const imageFile = req.files.image;
            
            // Проверяем тип файла
            if (!imageFile.mimetype.startsWith('image/')) {
                return res.status(400).json({ 
                    message: 'Загруженный файл не является изображением'
                });
            }
    
            // Генерируем уникальное имя файла
            const fileName = `${Date.now()}_${imageFile.name}`;
            const uploadPath = `./uploads/${fileName}`;
    
            // Сохраняем файл
            await imageFile.mv(uploadPath);
    
            const newEvent = await Event.create({
                title,
                text,
                date,
                price: parseInt(price, 10),
                pic: fileName // Сохраняем только имя файла
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
            const { title, text, date, price } = req.body;
            const updateData = { title, text, date, price };
    
            // Если загружен новый файл
            if (req.files && req.files.image) {
                const imageFile = req.files.image;
                
                // Проверяем тип файла
                if (!imageFile.mimetype.startsWith('image/')) {
                    return res.status(400).json({ 
                        message: 'Загруженный файл не является изображением'
                    });
                }
                
                // Генерируем уникальное имя файла
                const fileName = `${Date.now()}_${imageFile.name}`;
                const uploadPath = `./uploads/${fileName}`;
                
                // Сохраняем файл
                await imageFile.mv(uploadPath);
                updateData.pic = fileName;
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
