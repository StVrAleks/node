import { Basket, Flowers, BasketFlower } from '../models/models';
import ApiError from '../error/ApiError';
import logger from '../middleware/winston';
import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';


interface GetBasketQuery {
    userId: string; // В реальном проекте id будет браться из JWT-токена в request.user, но пока передаем через query
}

interface ClearBasketRequestBody {
    basketId: number;
}

class BasketController {
    
    // МЕТОД 1: Получить корзину пользователя со ВСЕМИ вложенными товарами
    async getByUserId(request: Request<{}, {}, {}, GetBasketQuery>, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { userId } = request.query;

            if (!userId) {
                return next(ApiError.badRequest('Идентификатор пользователя userId обязателен'));
            }

            // Ищем корзину пользователя. Если её нет — метод findOrCreate создаст её автоматически!
            // Он возвращает массив: [экземпляр_корзины, создана_ли_сейчас(true/false)]
            const [basket] = await Basket.findOrCreate({
                where: { userId: Number(userId) },
                defaults: { userId: Number(userId) } // Данные для создания, если не найдена
            });

            // Теперь делаем глубокий JOIN, чтобы вытащить не просто корзину, 
            // а все товары (Flowers) внутри неё через промежуточную таблицу!
            const fullBasket = await Basket.findOne({
                where: { id: basket.id },
                include: [
                    {
                        model: Flowers,
                        through: { attributes: ['id', 'quantity'] } 
                    }
                ]
            });

            return response.json(fullBasket);
        } catch (error: any) {
            return next(ApiError.internal('Ошибка сервера при получении корзины пользователя'));
        }
    }

    // МЕТОД 2: Очистить корзину (удалить все товары из неё за один раз)
    async clear(request: Request<{}, {}, ClearBasketRequestBody>,response: Response,  next: NextFunction): Promise<Response | void> {
        try {
            const { basketId } = request.body;

            if (!basketId) {
                return next(ApiError.badRequest('Идентификатор basketId обязателен для очистки корзины'));
            }

            // Вместо поштучного удаления сносим все строки в промежуточной таблице, 
            // где basketId равен нашему. Это работает мгновенно!
            const deletedCount  = await BasketFlower.destroy({
                where: { basketId: basketId, quantity: {[Op.gt]: 0 }}
            });

            return response.json({  
                message: 'Активные товары успешно удалены из корзины',
                deletedPositions: deletedCount  });
        } catch (error: any) {
            return next(ApiError.internal('Внутренняя ошибка сервера при очистке корзины'));
        }
    }
}

export default new BasketController();