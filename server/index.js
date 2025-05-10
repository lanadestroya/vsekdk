require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT || 5000

const app = express()

// Middleware
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:5001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Статические файлы
app.use(express.static(path.join(__dirname, '../client')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API routes
app.use('/api', router)

// Обработка всех остальных запросов
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'))
})

// Error handling
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        console.log('База данных подключена успешно')
        await sequelize.sync()
        console.log('Модели синхронизированы')
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Сервер запущен на порту ${PORT}`)
            console.log(`http://localhost:${PORT}`)
        })
    } catch (e) {
        console.error('Ошибка при запуске сервера:', e)
    }
}

start()

