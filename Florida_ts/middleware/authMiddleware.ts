import jwt from 'jsonwebtoken';
import {ICurrentUser} from '../controllers/userController.js'
import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';

export type CustomRequest = Request & {
    user: ICurrentUser; // строго в рамках этого типа user обязан быть
};


export default function (role?: string){

return function (request: CustomRequest, response: Response, next: NextFunction){
    try{
        let token: string | null = null;
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } 
        // 2. Если заголовка нет, берем из куки floweridaKey (для обычных переходов по ссылкам)
        else if (request.cookies && request.cookies.floweridaKey) {
            const cookieValue = request.cookies.floweridaKey;
            // Убираем префикс Bearer из куки, если он там запечен
            token = cookieValue.startsWith('Bearer ') ? cookieValue.split(' ')[1] : cookieValue;
        }


       if (!token) {
            // Если браузер запрашивал HTML-страницу, плавно редиректим на страницу входа
            if (request.accepts('html') && request.method === 'GET') {
                return response.redirect('/login');
            }
            return response.status(401).json({ message: "Пользователь не авторизован" });
        }
        const decoded =  jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key') as ICurrentUser;

        if (role && decoded.role !== role) {
            return next(ApiError.forbidden('Нет доступа: недостаточно прав'));
        }

        request.user = decoded;

        return next();
        } catch(er){
            return next(ApiError.forbidden('Не авторизован: неверный или просроченный токен'));
        }
    }
}