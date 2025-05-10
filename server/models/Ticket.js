const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Ticket = sequelize.define("ticket", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    status: { 
        type: DataTypes.STRING, 
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'cancelled', 'used']]
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Ticket; 