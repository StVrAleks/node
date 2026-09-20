import jwt from 'jsonwebtoken';
import { ICurrentUser } from '../controllers/userController.js'
import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';

export type CustomRequest = Request & {
    user?: ICurrentUser; // делаем необязательным, так как для гостей его не будет
};

export default function (role?: string) { // роль можно сделать необязательной, если это общая проверка
    return function (request: CustomRequest, response: Response, next: NextFunction) {
        try {
            if (request.method === 'OPTIONS')
                return next();

            // 1. Ищем токен: сначала в заголовках (для fetch-запросов), затем в куках (для переходов по ссылкам)
            let token : string | null = null;

            if (request.headers && request.headers.authorization) {
                token = request.headers.authorization.split(' ')[1];
            } else if (request.cookies && request.cookies.floweridaKey) {
                const cookieToken = request.cookies.floweridaKey;
                token = cookieToken.startsWith('Bearer ') ? cookieToken.split(' ')[1] : cookieToken;
            }

            // Если токена нет вообще — выкидываем ошибку 403 Forbidden согласно вашим предпочтениям
            if (!token)
                return next(ApiError.forbidden('Не авторизован'));

            // 2. Верифицируем токен
            const decoded = jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key') as ICurrentUser;
            
            // 3. Записываем данные в объект запроса, чтобы роутеры (например, /cabinet) имели к ним доступ
            request.user = decoded;

            // 4. ЕСЛИ передана конкретная роль (например, 'ADMIN'), проверяем её
            if (role && decoded.role !== role) {
                return next(ApiError.forbidden('Недостаточно прав доступа'));
            }

            // 5. Просто передаем управление следующему роутеру. НИКАКИХ response.json() здесь!
            return next();

        } catch (er) {
            // Если токен сломан или истек, возвращаем 401 статус
            return response.status(401).json({ message: 'Не авторизован' });
        }
    }
}