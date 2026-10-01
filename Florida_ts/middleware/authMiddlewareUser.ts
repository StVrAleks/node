import jwt from 'jsonwebtoken';
import {ICurrentUser} from '../controllers/userController.js'
import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';

export type CustomRequest = Request & {
    user: ICurrentUser; // строго в рамках этого типа user обязан быть
};

export default function authMiddlewareUser(request: Request, response: Response, next: NextFunction) {
    try {
        if (request.method === 'OPTIONS') return next();

        let token: string | null = null;

        if (request.headers && request.headers.authorization) {
            token = request.headers.authorization.split(' ')[1] || request.headers.authorization.split('%20')[1]; // Сплит по пробелу
        } else if (request.cookies && request.cookies.floweridaKey) {
            const cookieToken = request.cookies.floweridaKey;
            const tokenCond = cookieToken.startsWith('Bearer') ? cookieToken.split(' ')[1] : cookieToken.split('%20')[1]
            token = cookieToken.startsWith('Bearer') ? tokenCond : cookieToken;
        }

        if (!token) {
            response.locals.user = null;
            (request as any).user = undefined; 
            return next(); // <--- САМЫЙ ВАЖНЫЙ СЛЕДУЮЩИЙ ШАГ
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key') as ICurrentUser;
        
        (request as any).user = decoded;
        response.locals.user = decoded; // Данные улетают в main.hbs
        return next();

    } catch (er) {
        response.locals.user = null;
        (request as any).user = undefined; 
        return next();
    }
}
