const { User } = require('../models/models');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.roleName !== 'ADMIN') {
            return res.status(403).json({ message: 'Нет прав администратора' });
        }
        next();
    } catch (error) {
        console.error('Ошибка при проверке прав администратора:', error);
        res.status(500).json({ message: 'Ошибка при проверке прав администратора' });
    }
}; 