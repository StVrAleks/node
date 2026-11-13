const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Word = sequelize.define('Word', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    word: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    translation: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    maskedWord: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    wrongVariant: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    timesPlayed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    timesCorrect: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Word;