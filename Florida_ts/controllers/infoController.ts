import { FlowerInfo} from '../models/models.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

interface CreateInfoRequestBody {
    flowerId: number,
    title: string,
    description?: string | undefined
}
interface UpdateInfoRequestBody extends Partial<CreateInfoRequestBody> {
    id: number;
}
interface GetAllInfoInFlowerParams{
    id: number
}

interface ChangeInfoRequestBody {
    id: number,
    flowerId: number,
    title?: string,
    description?: string    
}

type GetOneCategoryParams = ParamsDictionary & {
    id?: string;
};

interface IncomingBlock {
    id?: number | null; // Если новая позиция — id может не быть
    title: string;
    description?: string;
}

class InfoController{
    async getAll(request: Request<GetAllInfoInFlowerParams>, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Получаем flowerId напрямую из параметров запроса
            const flowerId = Number(request.params.id);
            
            if (!flowerId) {
                return next(ApiError.badRequest('Параметр flowerId обязателен'));
            }

            // Находим абсолютно все описания для конкретного цветка без лимитов и смещений
            const rows = await FlowerInfo.findAll({
                where: { flowerId: Number(flowerId) }
            });

            if(rows.length === 0){        
                    return response.json({ mes: 'В базе отсутствует описание для этого цветка' });
                }

            // Возвращаем клиенту чистый массив строк (как у картинок)
            return response.json({ rows: rows });
        } catch (error: any) {
            logger.error('Ошибка в InfoController.getAll:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при получении описаний'));
        }
    }

    async getOne(request: Request<GetOneCategoryParams>, response: Response, next: NextFunction): Promise<Response | void>{
        try{
            const id = Number(request.params.id);

            if(isNaN(id))
                return next(ApiError.badRequest('Некорректный формат ID'));  

            const rows = await FlowerInfo.findOne({where: {id}});
            if (!rows) 
                return next(ApiError.notFound('Описание с таким ID не найдено')); 
            return response.json(rows);
        }
        catch(error:any){
             logger.error('Ошибка в InfoController.getOne:', error.message);
             return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));           
        }
    }

    async delete(request:  Request<GetOneCategoryParams>, response: Response, next: NextFunction): Promise<Response | void>{
        try{
            const id = Number(request.params.id);    
            if(isNaN(id))
                return next(ApiError.badRequest('Некорректный формат ID'));

            const infoRow = await FlowerInfo.findOne({ where: { id } });
            if (!infoRow) {
                 return next(ApiError.notFound('Описание с таким ID не найдено'));
            }
            const flowerId = infoRow.flowerId;

           const deletedRows = await FlowerInfo.destroy({where: {id: id}});
           return response.json({change: 'ok', flowerId: flowerId });           
        } catch(error:any){
            logger.error('Ошибка в InfoController.delete:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
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
                if (!block.title || block.title.trim() === "") continue;

                // МАГИЯ UPSERT: заменяет и UPDATE, и CREATE одновременно
                await FlowerInfo.upsert({
                    // Если block.id равен null, undefined или 0, Sequelize выполнит INSERT
                    id: block.id ? Number(block.id) : undefined, 
                    flowerId: Number(flowerId),
                    title: block.title.trim(),
                    description: block.description?.trim() || ''
                });
            }

            logger.info(`/Flowerida_Бэк: Успешно синхронизирована (upsert) группа описаний для цветка с ИД: ${flowerId}`);
            return response.json({ change: 'ok' });

        } catch (error: any) {
            logger.error('Ошибка в InfoController.updateBlocks:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при пакетном сохранении блоков описаний'));
        }
    }   
     
}

    export default new InfoController();