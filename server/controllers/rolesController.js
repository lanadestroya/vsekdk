const { Roles } = require('../models/models');
const ApiError = require('../error/ApiError');

class RoleController {
    async getAll(req, res) {
        try {
            const roles = await Roles.findAll();
            res.json(roles);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new RoleController();
