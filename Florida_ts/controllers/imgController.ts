import { FlowerImgs } from '../models/models.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';
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

interface UpdateImgNumRequestBody {
    num: number;
}


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

async saveGalleryGroup(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
        const { flowerId, existingImages, newImagesNum } = request.body;
        const files = request.files as Express.Multer.File[] || [];

        // 1. Обновляем порядок существующих картинок
        if (existingImages) {
            const oldImgs = JSON.parse(existingImages);
            for (const img of oldImgs) {
                await FlowerImgs.update({ num: Number(img.num) }, { where: { id: Number(img.id) } });
            }
        }

        // 2. Создаем новые картинки на основе загруженных файлов
        if (newImagesNum && files.length > 0) {
            const nums = JSON.parse(newImagesNum);
            for (let i = 0; i < files.length; i++) {
                // Здесь вызывается ваша утилита нарезки через GraphicsMagick (если есть), 
                // сохраняющая файл в финальное имя (например, files[i].filename)
                const finalImgName = files[i].filename; 

                await FlowerImgs.create({
                    flowerId: Number(flowerId),
                    img: finalImgName,
                    num: Number(nums[i] || 0)
                });
            }
        }

        logger.info(`/Групповое сохранение галереи для цветка ${flowerId} успешно выполнено`);
        return response.json({ change: 'ok' });
    } catch (error: any) {
        logger.error('Ошибка в ImgController.saveGalleryGroup:', error.message);
        return next(ApiError.internal('Ошибка сервера при групповом сохранении галереи'));
    }
}

}


export default new ImgController();