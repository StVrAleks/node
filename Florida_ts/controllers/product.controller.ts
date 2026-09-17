import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Flowers } from '../models/models.js'; // Ваша модель продукта

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    // Если поисковый запрос пустой, возвращаем пустой массив или все товары
    if (!q || typeof q !== 'string') {
      res.json([]);
      return;
    }

    const searchQuery = q.trim();

    const products = await Flowers.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
       /*   { description: { [Op.like]: `%${searchQuery}%` } }*/
        ]
      },
      // Ограничим выборку для поисковых подсказок или первой страницы
      limit: 10 
    });

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Ошибка при поиске товаров' });
  }
};