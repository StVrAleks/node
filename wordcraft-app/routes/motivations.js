const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Motivation } = require('../models');

// Подобрать поздравление по проценту правильных ответов
router.get('/:percent', async (req, res) => {
    try {
        const percent = parseInt(req.params.percent, 10) || 0;
        const motivation = await Motivation.findOne({
            where: {
                minPercent: { [Op.lte]: percent } // Ищем фразы с порогом <= результата игрока
            },
            order: [['minPercent', 'DESC']] // Берем самую высокую подходящую планку
        });

        res.json(motivation || { title: 'Молодец!', message: 'Тренировка завершена.' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки поздравления' });
    }
});

module.exports = router;