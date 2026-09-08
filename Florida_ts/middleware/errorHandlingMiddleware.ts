import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError';

// Одна чистая функция с 4 аргументами
export default function (error: any, request: Request, response: Response, next: NextFunction) {
    if (error instanceof ApiError) {
        return response.status(error.status).json({ mes: error.mes });
    }
    
    console.error(error);
    return response.status(500).json({ mes: "Непредвиденная ошибка!" });
}