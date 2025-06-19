const sequelize = require('../db')
const {DataTypes} = require('sequelize')
const Ticket = require('./Ticket')

// Роли пользователей
const Role = sequelize.define("role", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
});

// Пользователи
const User = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    roleId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false }
});

// Привязка пользователя к роли
User.belongsTo(Role);
Role.hasMany(User);

// Клиенты (связаны с пользователем)
const Client = sequelize.define("client", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    card: { type: DataTypes.STRING, allowNull: false },
});

Client.belongsTo(User);
User.hasOne(Client);

// Мероприятия
const Event = sequelize.define("event", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATE, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    pic: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false }
});

// Покупки билетов (связаны с клиентами и мероприятиями)
const Buy = sequelize.define("buy", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

Buy.belongsTo(Client);
Client.hasMany(Buy);

Buy.belongsTo(Event);
Event.hasMany(Buy);

// Связи для билетов
Ticket.belongsTo(Event);
Event.hasMany(Ticket);

Ticket.belongsTo(User);
User.hasMany(Ticket);

module.exports = { Role, User, Client, Event, Buy, Ticket };