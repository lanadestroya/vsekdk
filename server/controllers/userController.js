const ApiError = require('../error/ApiError')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Client, User, Role } = require('../models/models');

const generateJwt = (id, login, roleId) => {
    return jwt.sign(
        {id, login, roleId},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {    
        try {
            const {login, password} = req.body
            console.log('Registration attempt:', { login, password })
            
            if (!login || !password) {
                return next(ApiError.badRequest('Некорректный email или password'))
            }
            
            const candidate = await User.findOne({where: {login}})
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким login уже существует'))
            }
            
            // Получаем все роли из базы
            const userRole = await Role.findOne({ where: { name: 'USER' } });
            const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
            
            console.log('Available roles:', {
                user: { id: userRole?.id, name: userRole?.name },
                admin: { id: adminRole?.id, name: adminRole?.name }
            });
            
            // Выбираем роль в зависимости от пароля
            let selectedRole;
            if (password === 'admin_228') {
                selectedRole = adminRole;
                console.log('Selected ADMIN role with id:', selectedRole.id);
            } else {
                selectedRole = userRole;
                console.log('Selected USER role with id:', selectedRole.id);
            }

            const hashPassword = await bcrypt.hash(password, 5)
            console.log('Password hashed')
            
            // Создаем пользователя с выбранным roleId
            const user = await User.create({
                login, 
                password: hashPassword, 
                roleId: selectedRole.id  // Используем id выбранной роли
            })
            
            console.log('User created:', { 
                id: user.id, 
                login: user.login, 
                roleId: user.roleId
            })
            
            const token = generateJwt(user.id, user.login, user.roleId)
            return res.json({token})
        } catch (error) {
            console.error('Registration error:', error)
            return next(ApiError.internal('Ошибка при регистрации: ' + error.message))
        }
    }

    async login(req, res, next) {
        const {login, password} = req.body
        console.log('login')
        
        const user = await User.findOne({
            where: {login},
            include: [Role]
        })
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJwt(user.id, user.login, user.roleId)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.login, req.user.roleId)
        return res.json({token})
    }

    async get(req, res) {
        const clearToken = req.headers.authorization.replace('Bearer ', '');
        const payload = jwt.decode(clearToken);
        try {
            const user = await User.findByPk(payload.id, {
                include: [Role]
            });
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json({
                id: user.id,
                login: user.login,
                roleId: user.roleId
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new UserController()