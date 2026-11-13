const express = require('express');
const router = express.Router();
const { Word } = require('../models');

// Получить все слова конкретного списка
router.get('/list/:listId', async (req, res) => {
    try {
        const words = await Word.findAll({
            where: { listId: req.params.listId },
            order: [['createdAt', 'ASC']]
        });
        res.json(words);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при загрузке слов' });
    }
});

// Добавить новое слово в список
router.post('/', async (req, res) => {
    try {
        const { listId, word, translation, maskedWord, wrongVariant } = req.body;
        if (!listId || !word) {
            return res.status(400).json({ error: 'Не указан список или само слово' });
        }

        const cleanWord = word.trim();
        
        // Если пользователь не указал слово с пропуском, делаем пропуск автоматически (прячем гласную в середине)
        let finalMasked = maskedWord ? maskedWord.trim() : null;
        if (!finalMasked && cleanWord.length > 2) {
            const mid = Math.floor(cleanWord.length / 2);
            finalMasked = cleanWord.slice(0, mid) + '_' + cleanWord.slice(mid + 1);
        }

        const newWord = await Word.create({
            listId,
            word: cleanWord,
            translation: translation ? translation.trim() : null,
            maskedWord: finalMasked,
            wrongVariant: wrongVariant ? wrongVariant.trim() : null
        });

        res.status(201).json(newWord);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при добавлении слова' });
    }
});

// Обновить статистику слова после ответа в игре
router.patch('/:id/stats', async (req, res) => {
    try {
        const { isCorrect } = req.body;
        const word = await Word.findByPk(req.params.id);
        if (!word) return res.status(404).json({ error: 'Слово не найдено' });

        word.timesPlayed += 1;
        if (isCorrect) {
            word.timesCorrect += 1;
        }
        await word.save();

        res.json(word);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления статистики' });
    }
});

// Удалить слово
router.delete('/:id', async (req, res) => {
    try {
        await Word.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Слово удалено' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении слова' });
    }
});

module.exports = router;