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

            // ИСПРАВЛЕНО: Добавлен глубокий include для подтягивания картинок цветка
            const basketFlowers = await BasketFlower.findAll({
                where: { basketId: basket.id },
                include: [{ 
                    model: Flowers,
                    // Вытаскиваем картинки, привязанные к цветку, чтобы они отображались в корзине
                    include: [{ model: FlowerImgs, as: 'flower_imgs' }] 
                }]
            });

            // ИСПРАВЛЕНО: Считаем общее количество товаров в корзине (суммируем поле quantity каждого цветка)
            const cartCount = basketFlowers.reduce((sum, item: any) => sum + (Number(item.quantity) || 1), 0);

            if (basketFlowers.length === 0) {
                return response.json({
                    basketFlowers: [],
                    userProfile: currentUser ? currentUser.toJSON() : null,
                    cartCount: 0, // Отдаем ноль для шапки
                    mes: 'Ваша корзина пуста'
                });
            }    
            
            if (basketFlowers.length > 0) {
                return response.json({
                    basketFlowers: basketFlowers,
                    userProfile: currentUser ? currentUser.toJSON() : null,
                    cartCount: cartCount, // <-- ИСПРАВЛЕНО: Теперь шапка на странице корзины получит верные данные!
                    mes: 'Содержимое вашей корзины'
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

async add(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
        const userId = (request as any).user?.id;
        const { flowerId } = request.body; // quantity больше не нужен, так как это переключатель (1 или 0)

        if (!userId) {
            return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
        }

        // 1. Находим или создаем корзину пользователя
        const [basket] = await Basket.findOrCreate({
            where: { userId: Number(userId) }
        });

        // 2. Проверяем, есть ли уже этот цветок в корзине
        const existItem = await BasketFlower.findOne({
            where: { basketId: basket.id, flowerId: Number(flowerId) }
        });

        let action: 'added' | 'removed';

        if (existItem) {
            // ВТОРОЙ КЛИК: Цветок уже в корзине — удаляем его!
            await existItem.destroy();
            action = 'removed';
        } else {
            // ПЕРВЫЙ КЛИК: Цветка нет — добавляем (всего 1 шт.)
            await BasketFlower.create({
                basketId: basket.id,
                flowerId: Number(flowerId),
                quantity: 1
            });
            action = 'added';
        }

        // 3. Пересчитываем актуальное количество элементов в корзине для динамического обновления счетчика
        const cartCount = await BasketFlower.count({
            where: { basketId: basket.id }
        });

        return response.status(200).json({
            change: 'ok',
            action: action, // фронтенд будет знать, что произошло ('added' или 'removed')
            cartCount: cartCount
        });

    } catch (error: any) {
        console.error('Ошибка в basketUserController.addItem:', error.message);
        return next(ApiError.internal('Ошибка сервера при переключении состояния корзины'));
    }
}

}

export default new BasketController();