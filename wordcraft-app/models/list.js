const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const List = sequelize.define('List', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    language: {
        type: DataTypes.ENUM('ru', 'en'),
        allowNull: false
    }
});

module.exports = List;