import { Request, Response, NextFunction } from 'express';
import { Favorite, Vid, Flowers, FlowerImgs, BasketFlower, Basket } from '../models/models.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';

interface ToggleFavoriteRequestBody {
    flowerId: number;
    favorites: boolean;
}

class FavoriteController {
async getAll(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
        const userId = (request as any).user?.id;
        if (!userId) {
             return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
        }

        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 9;
        const offset = (page - 1) * limit;

        const { count, rows } = await Favorite.findAndCountAll({
            where: { userId },
            limit,
            offset,
            include: [
                {
                    model: Flowers,
                    include: [
                        {
                            model: FlowerImgs,
                            as: 'flower_imgs' // Подтягиваем картинки для каталога избранного!
                        }
                    ]
                },
                
            ],
            order: [['createdAt', 'DESC']],
            distinct: true // Защита от дублирования count при JOIN
        });

        const sanitizedRows = rows.map((item: any) => {
            const plainItem = item.toJSON();
            const flowerData = plainItem.flower || plainItem.Flower;
            
            return {
                id: plainItem.id,
                userId: plainItem.userId,
                flowerId: plainItem.flowerId,
                flower: flowerData ? {
                    id: flowerData.id,
                    name: flowerData.name,
                    price: flowerData.price,
                    // Гарантируем правильное имя массива картинок на фронте
                    flower_imgs: flowerData.flower_imgs || flowerData.FlowerImgs || []
                } : null
            };
        });

        return response.json({
            count: count,
            rows: sanitizedRows
        });

    } catch (error: any) {
        logger.error('Ошибка в FavoriteController.getAll:', error.message);
        return next(ApiError.internal('Внутренняя ошибка сервера при чтении списка избранного'));
    }
}

    async toggle(request: Request<{}, {}, ToggleFavoriteRequestBody>, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userId = (request as any).user?.id;
            const { flowerId } = request.body;

            // Если пользователь не авторизован — возвращаем forbidden в стиле вашего проекта
            if (!userId) {
                return next(ApiError.forbidden('Доступ запрещен: требуется авторизация для работы с избранным'));
            }

            if (!flowerId || isNaN(Number(flowerId))) {
                return next(ApiError.badRequest('Не указан или некорректно указан идентификатор цветка'));
            }

            // 1. Проверяем, лайкал ли этот пользователь данный цветок ранее
            const existingFavorite = await Favorite.findOne({
                where: {
                    userId: Number(userId),
                    flowerId: Number(flowerId)
                }
            });

            if (existingFavorite) {
                // СЦЕНАРИЙ А: Товар уже в избранном — удаляем лайк
                await existingFavorite.destroy();
                logger.info(`/Flowerida_Бэк: Пользователь ID ${userId} убрал из избранного цветок ID ${flowerId}`);
                
                // Возвращаем статус, чтобы фронтенд знал, что сердечко нужно "потушить"
                return response.json({ change: 'ok', isFavorite: false });
            } else {
                // СЦЕНАРИЙ Б: Товара нет в избранном — создаем новую запись в MySQL
                await Favorite.create({
                    userId: Number(userId),
                    flowerId: Number(flowerId)
                });
                logger.info(`/Flowerida_Бэк: Пользователь ID ${userId} добавил в избранное цветок ID ${flowerId}`);
                
                // Возвращаем статус, чтобы фронтенд знал, что сердечко нужно "зажечь"
                return response.json({ change: 'ok', isFavorite: true });
            }

        } catch (error: any) {
            logger.error('Ошибка в FavoriteController.toggle:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при изменении статуса избранного'));
        }
    }

    async getAllCategory(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            let { page, limit } = request.query;
            const currentPage = Number(page) || 1;
            const currentLimit = Number(limit) || 9;
            const offset = (currentPage - 1) * currentLimit;

            // 1. Получаем ID текущего пользователя из токена/куки
            const userId = (request as any).user?.id || null;

            // 2. Ищем ID корзины этого пользователя в базе данных
            let userBasketId: number | null = null;
            let cartCount : number = 0;
           if (userId) {
                // 1. Просто ищем корзину пользователя без всяких инклудов
                const basket = await Basket.findOne({ where: { userId: Number(userId) } });
                if (basket) {
                    userBasketId = basket.id;
                    // 2. Считаем количество записей напрямую в таблице BasketFlower по basketId
                    cartCount = await BasketFlower.count({ where: { basketId: basket.id } });
                }
            }

            // 3. Делаем один мощный запрос к БД
            const flowersData = await Flowers.findAndCountAll({
                limit: currentLimit,
                offset: offset,
                include: [
                    { model: Vid, as: 'flower_vid' },
                    { model: FlowerImgs, as: 'flower_imgs' },
                    // Избранное (уже работает)
                    ...(userId ? [{
                        model: Favorite,
                        as: 'favorites',
                        where: { userId: Number(userId) },
                        required: false
                    }] : []),
                    // ИСПРАВЛЕНО: Подмешиваем строки корзины ТОЛЬКО для корзины текущего юзера
                    ...(userBasketId ? [{
                        model: BasketFlower,
                        as: 'basket_flowers', // Этот алиас мы только что добавили в models.ts
                        where: { basketId: userBasketId },
                        required: false // Строго false (LEFT JOIN), чтобы не прятать товары, которых нет в корзине
                    }] : [])
                ],
                distinct: true
            });

            // 4. Формируем чистый JSON с флагами для фронтенда
            const sanitizedRows = flowersData.rows.map(flowerInstance => {
                const flower = flowerInstance.toJSON();
                
                // Проверяем статус избранного
                const isFavorite = !!(flower.favorites && flower.favorites.length > 0);
                
                // ИСПРАВЛЕНО: Проверяем статус корзины
                const isInBasket = !!(flower.basket_flowers && flower.basket_flowers.length > 0);

                // Удаляем сырые массивы связей, чтобы не раздувать трафик
                delete flower.favorites;
                delete flower.basket_flowers;

                return {
                    ...flower,
                    isFavorite,
                    isInBasket // Отдаем готовый флаг на фронтенд!
                };
            });

            return response.status(200).json({
                total: flowersData.count,
                rows: sanitizedRows,
                cartCount: cartCount
            });

        } catch (error: any) {
            console.error('Ошибка в FlowerController.getAllCategory:', error);
            return next(ApiError.internal('Внутренняя ошибка сервера при загрузке каталога'));
        }
    }
}

export default new FavoriteController();
