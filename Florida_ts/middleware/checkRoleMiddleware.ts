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
        if(!request.headers || !request.headers.authorization)
            return next(ApiError.forbidden('Не авторизован'));

        const token = request.headers.authorization.split(' ')[1];
        if (!token) {
            return next(ApiError.forbidden('Не авторизован'));
        }


        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key')  as ICurrentUser;

        if(decoded.role != role){
             return next(ApiError.forbidden('Нет доступа'));
        }

        request.user = decoded;
         return next();
    } catch(er : any){
        return next(ApiError.forbidden('Не авторизован или токен устарел'));
    } 
    }
 
}