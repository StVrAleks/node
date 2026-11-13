const express = require('express');
const router = express.Router();
const { List, Word } = require('../models');

// Получить все списки (вместе с количеством слов в каждом)
router.get('/', async (req, res) => {
    try {
        const lists = await List.findAll({
            include: [{ model: Word, attributes: ['id'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(lists);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении списков' });
    }
});

// Создать новый список
router.post('/', async (req, res) => {
    try {
        const { title, language } = req.body;
        if (!title || !language) {
            return res.status(400).json({ error: 'Укажите название и язык списка' });
        }
        const newList = await List.create({ title, language });
        res.status(201).json(newList);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при создании списка' });
    }
});

// Удалить список (слова удалятся автоматически благодаря CASCADE)
router.delete('/:id', async (req, res) => {
    try {
        await List.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Список удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении списка' });
    }
});

module.exports = router;