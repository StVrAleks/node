const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Отключаем спам SQL-запросами в консоль
        define: {
            timestamps: true, // Автоматически добавляет createdAt и updatedAt
            charset: 'utf8mb4', // Поддержка русского языка и эмодзи 🏆🔥
            collate: 'utf8mb4_unicode_ci'
        }
    }
);

module.exports = sequelize;