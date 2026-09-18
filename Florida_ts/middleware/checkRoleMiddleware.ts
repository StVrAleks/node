import jwt from 'jsonwebtoken';
import {ICurrentUser} from '../controllers/userController.js'
import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';

export type CustomRequest = Request & {
    user: ICurrentUser; // строго в рамках этого типа user обязан быть
};

export default function (role:string){

    return function(request: CustomRequest, response: Response, next: NextFunction){
          if(request.method === 'OPTIONS')
            return next();
    try{
 let token: string | null = null;
            const authHeader = request.headers.authorization;

            // 1. Ищем в заголовках
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            } 
            // 2. Ищем в куках
            else if (request.cookies && request.cookies.floweridaKey) {
                const cookieValue = request.cookies.floweridaKey;
                token = cookieValue.startsWith('Bearer ') ? cookieValue.split(' ')[1] : cookieValue;
            }
        if (!token) {
            return next(ApiError.forbidden('Не авторизован'));
        }


        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key')  as ICurrentUser;

        if(decoded.role != role){
  if (request.accepts('html')) {
                    return response.send('<h1>Ошибка 403: Доступ запрещен. У вас нет прав администратора.</h1>');
                }
                return response.status(403).json({ message: "Нет доступа: недостаточно прав" });
        }

        request.user = decoded;
         return next();
    } catch(er : any){
        return next(ApiError.forbidden('Не авторизован или токен устарел'));
    } 
    }
 
}