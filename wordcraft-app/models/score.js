const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Score = sequelize.define('Score', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    playerName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true // Одно имя — одна строка в таблице рекордов
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Score;