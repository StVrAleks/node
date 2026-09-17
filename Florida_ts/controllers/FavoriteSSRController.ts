import { Request, Response, NextFunction } from 'express';
import { User } from '../models/models.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';

class FavoriteSSRController {
    /**
     * Рендеринг страницы Избранного (GET /favorites)
     */
    async renderFavorites(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            // Данные пользователя из токена, расшифрованные в authMiddleware
            const tokenUser = (request as any).user;

            // Если пользователь зашел без токена, отдаем forbidden в стиле вашего проекта
            if (!tokenUser || !tokenUser.id) {
                return next(ApiError.forbidden('Доступ запрещен: для просмотра избранного необходимо войти в аккаунт'));
            }

            // Вытягиваем свежие данные пользователя из MySQL для корректного отображения шапки (layout)
            const currentUser = await User.findByPk(tokenUser.id, {
                attributes: ['id', 'name', 'email', 'role']
            });

            if (!currentUser) {
                return next(ApiError.notFound('Пользователь не найден в системе'));
            }

            // Компилируем и отдаем страницу favorites.hbs внутрь вашего главного макета
            return response.render('favorites', {
                title: 'Моё Избранное | Flowerida',
                user: currentUser.toJSON() // Передаем данные пользователя, чтобы в шапке вывелось "Привет, Имя"
            });

        } catch (error: any) {
            logger.error('Ошибка в FavoriteSSRController.renderFavorites:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при генерации страницы избранного'));
        }
    }
}

export default new FavoriteSSRController();