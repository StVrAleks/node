const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Motivation = sequelize.define('Motivation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    minPercent: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    message: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
});

module.exports = Motivation;