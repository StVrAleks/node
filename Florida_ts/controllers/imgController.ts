import { FlowerImgs } from '../models/models';
import ApiError from '../error/ApiError';
import logger from '../middleware/winston';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

// ИСПРАВЛЕНО: Добавили поле num, которое прилетает с фронтенда для сортировки
interface CreateImgRequestBody {
    flowerId: number;
    img: string;
    num: number;
}

// Тип для параметров пути, содержащих flowerId или id картинки
type FlowerParams = ParamsDictionary & {
    flowerId?: string;
    id?: string;
};

class ImgController {

    // 1. Создание записи картинки в MySQL
    async create(request: Request<{}, {}, CreateImgRequestBody>, response: Response, next: NextFunction): Promise<Response | void> {
        try {       
            const { flowerId, img, num } = request.body;
            if (!flowerId || !img || !num) {
                 return next(ApiError.badRequest('Не указан идентификатор цветка, номер или не добавлено имя изображения'));
            }

            // ИСПРАВЛЕНО: Передаем num в базу данных
            const flrows = await FlowerImgs.create({ flowerId, img, num });
            logger.info(`/добавили новое изображение для цветка с ИД: ${flowerId}, позиция: ${num}`);
            return response.status(201).json(flrows);
        } catch (error: any) {
            logger.error('Ошибка в ImgController.create:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при сохранении изображения'));
        }
    }

    // 2. Получение всех картинок цветка (ИСПРАВЛЕНО под путь /api/imgs/getAll/:flowerId)
    async getAll(request: Request<FlowerParams>, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            // ИСПРАВЛЕНО: Читаем flowerId из params, как у вас написано в fetch(`/api/imgs/getAll/\${flowerId}`)
            const { flowerId } = request.params;
            
            if (!flowerId) {
                return next(ApiError.badRequest('Параметр flowerId в пути обязателен'));
            }
        
            const result = await FlowerImgs.findAndCountAll({
                where: { flowerId: Number(flowerId) },
                order: [
                    ['num', 'ASC'], 
                    ['id', 'ASC']
                ]
            });

            return response.json({
                count: result.count,
                rows: result.rows
            });
        } catch (error: any) {
            logger.error('Ошибка в ImgController.getAll:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при чтении галереи изображений'));
        }
    }

    // 3. Получение одной картинки
    async getOne(request: Request<FlowerParams>, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            const id = Number(request.params.id);

            if (isNaN(id)) {
                return next(ApiError.badRequest('Некорректный формат ID изображения')); 
            }
            const rows = await FlowerImgs.findOne({ where: { id } });

            if (!rows) {
                return next(ApiError.notFound('Изображение с таким ID не найдено'));     
            }

            return response.json(rows);
        } catch (error: any) {
            logger.error('Ошибка в ImgController.getOne:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при поиске изображения'));
        }
    }
    
    // 4. Удаление картинки
    async delete(request: Request<FlowerParams>, response: Response, next: NextFunction): Promise<Response | void> {
        const id = Number(request.params.id);
        if (isNaN(id)) {
            return next(ApiError.badRequest('Некорректный формат ID'));
        }
        try {
            const deletedImgs = await FlowerImgs.destroy({ where: { id: id } });

            if (deletedImgs === 0) {
                return next(ApiError.badRequest('Картинки с таким ID не найдено'));
            }

            return response.json({ change: 'ok' });           
        } catch (error: any) {
            logger.error('Ошибка в ImgController.delete:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при удалении изображения'));
        }
    }
}

export default new ImgController();