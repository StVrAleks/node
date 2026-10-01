import { Request, Response, NextFunction } from 'express';
import { Favorite, Flowers, FlowerImgs } from '../models/models.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';

interface ToggleFavoriteRequestBody {
    flowerId: number;
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
                  //  as: 'Flowers', // Убедитесь, что этот alias совпадает с вашей моделью Favorite.belongsTo(Flowers)
                    include: [
                        {
                            model: FlowerImgs,
                            as: 'flower_imgs' // Подтягиваем картинки для каталога избранного!
                        }
                    ]
                }
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
}

export default new FavoriteController();
