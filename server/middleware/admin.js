const { User, Role } = require('../models/models');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [Role]
        });
        if (!user || user.roleId !== 2) { // 2 - это id роли ADMIN
            return res.status(403).json({ message: 'Нет прав администратора' });
        }
        next();
    } catch (error) {
        console.error('Ошибка при проверке прав администратора:', error);
        res.status(500).json({ message: 'Ошибка при проверке прав администратора' });
    }
}; 