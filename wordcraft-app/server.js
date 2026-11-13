const express = require('express');
require('dotenv').config();
const { sequelize, Motivation } = require('./models');

const app = express(); // Сначала создаем app
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Подключаем API-маршруты
app.use('/api/lists', require('./routes/lists'));
app.use('/api/words', require('./routes/words'));
app.use('/api/motivations', require('./routes/motivations'));
app.use('/api/scores', require('./routes/scores'));

// Функция начального заполнения поздравлений
async function seedMotivations() {
    const count = await Motivation.count();
    if (count === 0) {
        await Motivation.bulkCreate([
            { minPercent: 100, title: 'Безупречно! 🏆', message: 'Ни единой ошибки! Настоящий мастер слов.' },
            { minPercent: 80, title: 'Отличный результат! 🔥', message: 'Почти идеально, осталось совсем чуть-чуть.' },
            { minPercent: 50, title: 'Хорошая попытка! 👍', message: 'Неплохо, но сложные слова стоит повторить еще раз.' },
            { minPercent: 0, title: 'Не сдавайся! 💪', message: 'Ошибки — это часть обучения. Попробуй снова!' }
        ]);
        console.log('Базовые поздравления добавлены в БД.');
    }
}

// Запуск сервера и синхронизация с БД
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Успешное подключение к MySQL.');

        await sequelize.sync({ alter: true });
        console.log('✅ Таблицы синхронизированы.');

        await seedMotivations();

        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Ошибка запуска или подключения к БД:', error);
    }
}

startServer();