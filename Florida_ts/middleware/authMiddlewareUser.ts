import jwt from 'jsonwebtoken';
import {ICurrentUser} from '../controllers/userController.js'
import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError.js';

export type CustomRequest = Request & {
    user: ICurrentUser; // строго в рамках этого типа user обязан быть
};

export default function (role:string){

return function  (request: CustomRequest, response: Response, next: NextFunction){
    try{
        if(request.method === 'OPTIONS')
            return next();

        const authUser = {'authName':'', 'authEmail':''};
        if(!request.headers || !request.headers.authorization)
            return next(ApiError.forbidden('Не авторизован'));

        const token = request.headers.authorization.split(' ')[1];
        if(!token)
            return next(ApiError.forbidden('Не авторизован'));

        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'default_secret_key') as ICurrentUser
       // console.log(decoded);
        request.user = decoded;
        authUser['authName'] = decoded.name;
        authUser['authEmail'] = decoded.email;
        response.json({authUser});
        return next();
    } catch(er){
        response.status(401).json({message: 'Не авторизован'});
    }
}
}