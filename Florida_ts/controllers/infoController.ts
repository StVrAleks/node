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
interface GetAllInfoQuery {
    flowerId: number,
    limit?: string,
    page?: string
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


class InfoController{
    async create(request: Request<{}, {}, CreateInfoRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
    try {       
        const {flowerId, title, description} =  request.body;
        if(!flowerId || !title)
            return next(ApiError.badRequest('Не указан цветок или название блока с описанием'));


        const inforow = await FlowerInfo.create({flowerId, title, description});
        logger.info(`/добавили новый блок описания для цветка ${flowerId} с загаловком: ${title}`);
        return response.status(201).json(inforow);
        }
    catch(error: any){
        logger.error('Ошибка в InfoController.create:', error.message);
        return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
        }
    }

async getAll(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
        // Получаем flowerId напрямую из параметров запроса
        const { flowerId } = request.query;
        
        if (!flowerId) {
            return next(ApiError.badRequest('Параметр flowerId обязателен'));
        }

        // Находим абсолютно все описания для конкретного цветка без лимитов и смещений
        const rows = await FlowerInfo.findAll({
            where: { flowerId: Number(flowerId) }
        });

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


            const deletedRows = await FlowerInfo.destroy({where: {id: id}});
            if (deletedRows === 0) 
                return next(ApiError.notFound('Описание с таким ID не найдено'));
           return response.json({change: 'ok'});           
        }catch(error:any){
            logger.error('Ошибка в InfoController.delete:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
        }
        }

    async update(request: Request<{}, {}, ChangeInfoRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
            try{
                const {id, flowerId, title, description} = request.body;
                if(!id || !flowerId)
                return next(ApiError.badRequest('Не корректно указан идентификатор'));

                const updateData: Partial<CreateInfoRequestBody> = {};
                if (title !== undefined) updateData.title = title;
                if (description !== undefined) updateData.description = description;

                const [rowsUpdated] = await FlowerInfo.update(updateData,{where: {id: id}});

                if (rowsUpdated === 0) 
                    return next(ApiError.notFound('Описание с таким ID не найдено или данные идентичны'));

                    return response.json({change: 'ok'});           
            }catch(error:any){
                logger.error('Ошибка в InfoController.update:', error.message);
                return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
            }
        }    
    async updateBlocks(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { flowerId, descriptions } = request.body;

            if (!flowerId || !Array.isArray(descriptions)) {
                return next(ApiError.badRequest('Не указан идентификатор цветка или передан неверный формат данных'));
            }

            // Цикл обработки прилетевших блоков контента
            for (const block of descriptions) {
                if (block.id) {
                    // Сценарий 1: Запись существует — обновляем только текстовые поля
                    await FlowerInfo.update(
                        { 
                            title: block.title, 
                            description: block.description
                        },
                        { where: { id: Number(block.id), flowerId: Number(flowerId) } }
                    );
                } else {
                    // Сценарий 2: Это новый блок — создаем чистую запись в MySQL
                    await FlowerInfo.create({
                        flowerId: Number(flowerId),
                        title: block.title,
                        description: block.description
                    });
                }
            }

            logger.info(`/Flowerida_Бэк: Успешно сохранена группа описаний для цветка с ИД: ${flowerId}`);
            return response.json({ change: 'ok' });

        } catch (error: any) {
            logger.error('Ошибка в InfoController.updateBlocks:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при пакетном сохранении блоков описаний'));
        }
    }      
}

    export default new InfoController();