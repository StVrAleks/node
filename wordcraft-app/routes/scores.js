const express = require('express');
const router = express.Router();
const { Score } = require('../models');

// Получить топ-15 игроков
router.get('/', async (req, res) => {
    try {
        const leaders = await Score.findAll({
            order: [['points', 'DESC']],
            limit: 15
        });
        res.json(leaders);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка загрузки рекордов' });
    }
});

// Начислить баллы игроку (создает запись, если имя новое, или прибавляет к текущей)
router.post('/add', async (req, res) => {
    try {
        const { playerName, points } = req.body;
        if (!playerName || typeof points !== 'number') {
            return res.status(400).json({ error: 'Некорректные данные' });
        }

        const cleanName = playerName.trim();
        const [player] = await Score.findOrCreate({
            where: { playerName: cleanName },
            defaults: { points: 0 }
        });

        player.points += points;
        await player.save();

        res.json(player);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сохранения баллов' });
    }
});

module.exports = router;