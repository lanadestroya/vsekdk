const { Client } = require('../models/models');
const ApiError = require('../error/ApiError');

class ClientController {
    async getAll(req, res) {
        try {
            const clients = await Client.findAll();
            res.json(clients);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getOne(req, res) {
        try {
            const client = await Client.findByPk(req.params.id);
            if (!client) return res.status(404).json({ message: 'Client not found' });
            res.json(client);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const { email, name, card, userID } = req.body;
            const newClient = await Client.create({ email, name, card, userID });
            res.status(201).json(newClient);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new ClientController();
