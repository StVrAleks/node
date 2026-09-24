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

interface IncomingBlock {
    id?: number | null; // Если новая позиция — id может не быть
    img: string;
    num?: string;
}

interface IncomingImageBlock {
    id?: number | null; // Для новых картинок id будет null или undefined
    img: string;        // Имя файла (например, "file-1727000.jpg")
    num: number;        // Порядковый номер (сортировка)
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

   async update(request: Request<{}, {}, { flowerId: number, descriptions: IncomingBlock[] }>, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { flowerId, descriptions } = request.body;

            if (!flowerId || !Array.isArray(descriptions)) {
                return next(ApiError.badRequest('Не указан идентификатор цветка или передан неверный формат данных'));
            }

            // Цикл обработки прилетевших блоков контента
            for (const block of descriptions) {
                // Защита: пропускаем пустые строки, если админ случайно добавил пустую форму
                if (!block.img) continue;

                // МАГИЯ UPSERT: заменяет и UPDATE, и CREATE одновременно
                await FlowerImgs.upsert({
                    id: block.id ? Number(block.id) : undefined, 
                    flowerId: Number(flowerId),
                    img: block.img,
                    num: Number(block.num)
                });
            }

            logger.info(`/Flowerida_Бэк: Успешно синхронизирована (upsert) группа изображений для цветка с ИД: ${flowerId}`);
            return response.json({ change: 'ok' });

        } catch (error: any) {
            logger.error('Ошибка в InfoController.updateBlocks:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при пакетном сохранении блоков описаний'));
        }
    }       

    // 2. Получение всех картинок цветка (ИСПРАВЛЕНО под путь /api/imgs/getAll/:flowerId)
    async getAll(request: Request<FlowerParams>, response: Response, next: NextFunction): Promise<Response | void> {
      try {
            // ИСПРАВЛЕНО: Читаем flowerId из params, как у вас написано в fetch(`/api/imgs/getAll/\${flowerId}`)
           const flowerId = Number(request.params.id);
            
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
            const id = Number(request.params.flowerId);

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

        console.log("=== ДАННЫЕ В saveGalleryGroup ===");
        console.log("flowerId:", flowerId);
        console.log("existingImages (строка):", existingImages);

        if (!flowerId) {
            return next(ApiError.badRequest('Не передан flowerId'));
        }

        // 1. Обновляем порядок существующих картинок
        if (existingImages) {
            // МУЛЬТЕР ПРИСЫЛАЕТ СТРОКУ! Обязательно делаем JSON.parse
            const oldImgs = JSON.parse(existingImages); 
            
            for (const img of oldImgs) {
                if (!img.id) continue;
                await FlowerImgs.update(
                    { num: Number(img.num) }, 
                    { where: { id: Number(img.id), flowerId: Number(flowerId) } }
                );
            }
        }

        // 2. Создаем новые картинки на основе загруженных файлов
        if (newImagesNum && files.length > 0) {
            const nums = JSON.parse(newImagesNum);
            for (let i = 0; i < files.length; i++) {
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
        // ВАЖНО: если упало, возвращаем 500 ошибку, а не пустой статус 200!
        return next(ApiError.internal('Внутренняя ошибка сервера при пакетном сохранении галереи'));
    }
}

async updateGalleryGroup(request: Request<{}, {}, { flowerId: number, images: IncomingImageBlock[] }>, response: Response, next: NextFunction): Promise<Response | void> {
    try {
        const { flowerId, images } = request.body;

        if (!flowerId || !Array.isArray(images)) {
            return next(ApiError.badRequest('Не указан цветок или передан неверный формат галереи'));
        }

        for (const block of images) {
            if (!block.img || block.img.trim() === "") continue;

            // Строим чистый объект для базы данных
            const upsertData: any = {
                flowerId: Number(flowerId),
                img: block.img.trim(),
                num: Number(block.num) || 0
            };

            // Если id прилетел с фронта и он валидный — добавляем его. 
            // Если его нет (null) — Sequelize сам сгенерирует новый автоинкрементный ID.
            if (block.id !== null && block.id !== undefined && !isNaN(Number(block.id))) {
                upsertData.id = Number(block.id);
            }

            // Выполняем UPSERT
            await FlowerImgs.upsert(upsertData);
        }

        logger.info(`/Flowerida_Бэк: Успешно выполнена пакетная синхронизация для цветка ID ${flowerId}`);
        return response.json({ change: 'ok' });

    } catch (error: any) {
        logger.error('Ошибка в ImgController.updateGalleryGroup:', error.message);
        return next(ApiError.internal('Ошибка сервера при пакетном сохранении галереи'));
    }
}

}


export default new ImgController();