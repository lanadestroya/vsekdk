const { Event } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid')
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Создаем директорию для загрузки, если она не существует
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Настройка destination для файла:', file);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        console.log('Генерация имени файла для:', file);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        console.log('Проверка файла:', file);
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Только изображения!'), false);
        }
        cb(null, true);
    }
}).single('image');

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

    async create(req, res, next) {
        console.log('Начало создания события');
        console.log('Headers:', req.headers);
        console.log('Body до загрузки:', req.body);

        upload(req, res, async function (err) {
            if (err) {
                console.error('Ошибка загрузки файла:', err);
                return res.status(400).json({ 
                    message: err.message,
                    details: err.stack
                });
            }

            try {
                console.log('Файл загружен успешно');
                console.log('Body после загрузки:', req.body);
                console.log('File:', req.file);

                const { title, date, price, text } = req.body;
                
                // Проверяем наличие всех необходимых полей
                if (!date || !title || !text) {
                    console.log('Отсутствуют обязательные поля:', { date, title, text });
                    return res.status(400).json({ 
                        message: 'Необходимо заполнить все поля',
                        received: { date, title, text }
                    });
                }

                if (!req.file) {
                    console.log('Файл не загружен');
                    return res.status(400).json({ message: 'Необходимо загрузить изображение' });
                }

                console.log('Создание события с данными:', {
                    date,
                    title,
                    text,
                    pic: req.file.filename
                });

                const newEvent = await Event.create({
                    date,
                    title,
                    text,
                    pic: req.file.filename,
                    price: parseInt(price, 10)
                });

                console.log('Событие успешно создано:', newEvent);
                res.status(201).json(newEvent);
            } catch (error) {
                console.error('Ошибка при создании события:', error);
                res.status(500).json({ 
                    message: 'Ошибка при создании события',
                    error: error.message,
                    stack: error.stack
                });
            }
        });
    }

    async update(req, res, next) {
        upload(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            try {
                const { date, title, text } = req.body;
                const updateData = { date, title, text };

                if (req.file) {
                    updateData.pic = req.file.filename;
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
        });
    }

    async delete(req, res, next) {
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
