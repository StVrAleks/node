import { Request, Response, NextFunction } from 'express';
import { User } from '../models/models';
import ApiError from '../error/ApiError';
import logger from '../middleware/winston';

class CabinetController {
    /**
     * Рендеринг страницы личного кабинета (GET /cabinet)
     */
    async renderCabinet(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            // Данные пользователя из authMiddleware (токен)
            const tokenUser = (request as any).user;

            // Если middleware по какой-то причине пропустил неавторизованного, отдаем forbidden
            if (!tokenUser || !tokenUser.id) {
                return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
            }

            // Делаем запрос в базу данных MySQL, чтобы вытащить самые свежие данные профиля
            const currentUser = await User.findByPk(tokenUser.id, {
                attributes: ['id', 'name', 'email', 'phone', 'address', 'role'] // Исключаем хеш пароля из соображений безопасности
            });

            if (!currentUser) {
                return next(ApiError.notFound('Пользователь не найден в системе'));
            }

            // Рендерим шаблон cabinet.hbs через Express-Handlebars
            // Передаем объект user и настраиваем разметку layout
            return response.render('cabinet', {
                title: 'Личный кабинет | Flowerida',
                user: currentUser.toJSON(), // Переводим инстанс Sequelize в чистый JSON-объект для Handlebars
                // Если у вас в главном макете layout.hbs (main.hbs) шапка проверяет роли, 
                // объект user автоматически станет доступен для выражений {{#if user}} и {{user.name}}
            });

        } catch (error: any) {
            logger.error('Ошибка в CabinetController.renderCabinet:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при генерации личного кабинета'));
        }
    }
}

export default new CabinetController();