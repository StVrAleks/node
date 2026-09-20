import { Basket, Flowers, BasketFlower, FlowerImgs, User } from '../models/models.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';
import { Op } from 'sequelize';
import { Request, Response, NextFunction } from 'express';

class BasketController {
    
    // МЕТОД 1: Возвращает данные корзины для fetch-запросов (JSON) или для SSR
    async cart(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = (request as any).user?.id;

            if (!userId) {
                return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
            }
        const currentUser = await User.findByPk(userId, {
            attributes: ['phone', 'address'] 
        });
 
 BasketFlower.belongsTo(Flowers, { foreignKey: 'flowerId' });

const [basket] = await Basket.findOrCreate({
    where: { userId: Number(userId) }
});

// Теперь этот запрос точно выполнится!
const basketFlowers = await BasketFlower.findAll({
    where: { basketId: basket.id },
    include: [{ model: Flowers }]
});

            if(basketFlowers && basketFlowers.length === 0){
                return response.json({
                basketFlowers: [],
                userProfile: currentUser ? currentUser.toJSON() : null,
                mes: 'Ваша корзина пуста' // Если фронтенду вдруг понадобится строка сообщения
                });
            }
             
        } catch (error: any) {
            console.error('🔥 КРИТИЧЕСКАЯ ОШИБКА ДЕБАГА BAF_FIND_ALL:', error.message);
                if (error.stack) console.error(error.stack);

                logger.error('Ошибка в BasketController.cart:', error.message);
                return next(ApiError.internal('Ошибка сервера при получении корзины пользователя'));
        }
    }

    // МЕТОД 2: Очистить корзину (удалить все товары из неё за один раз)
    async clear(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            // БЕЗОПАСНОСТЬ: Берем ID пользователя из токена, а не из request.body!
            const userId = (request as any).user?.id;

            if (!userId) {
                return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
            }

            // Находим корзину этого конкретного юзера
            const userBasket = await Basket.findOne({ where: { userId: Number(userId) } });
            
            if (!userBasket) {
                return next(ApiError.notFound('Корзина пользователя не найдена в системе'));
            }

            // Сносим все строки в промежуточной таблице для этой корзины, где количество > 0
            const deletedCount = await BasketFlower.destroy({
                where: { 
                    basketId: userBasket.id, 
                    quantity: { [Op.gt]: 0 } 
                }
            });

            return response.json({  
                change: 'ok',
                message: 'Все активные товары успешно удалены из корзины',
                deletedPositions: deletedCount  
            });
        } catch (error: any) {
            logger.error('Ошибка в BasketController.clear:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при очистке корзины'));
        }
    }

 async deleteItem(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
        const userId = (request as any).user?.id;
        const { flowerId } = request.body; // Получаем ID цветка, который нужно удалить

        if (!userId) {
            return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
        }

        if (!flowerId) {
            return next(ApiError.badRequest('Идентификатор flowerId обязателен'));
        }

        // 1. Ищем корзину этого юзера в MySQL
        const userBasket = await Basket.findOne({ where: { userId: Number(userId) } });
        if (!userBasket) {
            return next(ApiError.notFound('Корзина не найдена'));
        }

        // 2. Удаляем запись из промежуточной таблицы
        const deletedRow = await BasketFlower.destroy({
            where: {
                basketId: userBasket.id,
                flowerId: Number(flowerId)
            }
        });

        return response.json({ 
            change: 'ok', 
            message: 'Товар успешно удален из корзины',
            deleted: !!deletedRow 
        });

    } catch (error: any) {
        logger.error('Ошибка в BasketController.deleteItem:', error.message);
        return next(ApiError.internal('Внутренняя ошибка сервера при удалении товара'));
    }
}   
}

export default new BasketController();