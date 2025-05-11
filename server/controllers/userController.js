const ApiError = require('../error/ApiError')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Client } = require('../models/models');
const {User} = require('../models/models')

const generateJwt = (id, email, roleName) => {
    return jwt.sign(
        {id, email, roleName},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {    
        const {login, password, roleName} = req.body
        console.log('reg')
        if (!login || !password) {
            return next(ApiError.badRequest('Некорректный email или password'))
        }
        const candidate = await User.findOne({where: {login}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким login уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({login, roleName, password: hashPassword})
        const token = generateJwt(user.id, user.login, user.roleName)
        return res.json({token})
    }

    async login(req, res, next) {
        const {login, password} = req.body
        console.log('login')
        
        const user = await User.findOne({where: {login}})
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJwt(user.id, user.login, user.roleName)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.login, req.user.roleName)
        return res.json({token})
    }

    async get(req, res) {
        const clearToken = req.headers.authorization.replace('Bearer ', '');
        const payload = jwt.decode(clearToken);
        try {
            const client = await User.findByPk(payload.id);
            if (!client) return res.status(404).json({ message: 'Client not found' });
            res.json({
                id: client.id,
                login: client.login,
                roleName: client.roleName
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new UserController()