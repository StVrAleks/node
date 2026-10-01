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
        if (request.method === 'OPTIONS') return next();
        let token: string | null = null;

        if (request.headers && request.headers.authorization) {
            const authHeader = request.headers.authorization;
            if(authHeader.includes(' '))
                token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
            else if(authHeader.includes('%20'))
                token = authHeader.startsWith('Bearer%20') ? authHeader.split(' ')[1] : authHeader;
        } else if (request.cookies && request.cookies.floweridaKey) {
           let cookieToken = request.cookies.floweridaKey;
           cookieToken = decodeURIComponent(cookieToken);
            if (cookieToken.startsWith('Bearer ') || cookieToken.startsWith('Bearer%20')) {
                token = cookieToken.split(' ')[1] || cookieToken.split('%20')[1];
            } else {
                token = cookieToken;
            }
        }
       if (!token || token.trim() === "") {
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
        response.locals.user = decoded;

        return next();
        } catch(er: any){
            if (request.accepts('html') && request.method === 'GET') {
                return response.redirect('/login');
            }
            return next(ApiError.forbidden('Не авторизован: неверный или просроченный токен'));
        }
    }
}