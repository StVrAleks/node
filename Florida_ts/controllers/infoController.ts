import { FlowerInfo} from '../models/models';
import ApiError from '../error/ApiError';
import logger from '../middleware/winston';
import { Request, Response, NextFunction } from 'express';

interface CreateInfoRequestBody {
    flowerId: number,
    title: string,
    discription?: string | undefined
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
    discription?: string    
}

interface GetOneInfoParams {
    id: string;
}

class InfoController{
    async create(request: Request<{}, {}, CreateInfoRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
    try {       
        const {flowerId, title, discription} =  request.body;
        if(!flowerId || !title)
            return next(ApiError.badRequest('Не указан цветок или название блока с описанием'));


        const inforow = await FlowerInfo.create({flowerId, title, discription});
        logger.info(`/добавили новый блок описания для цветка ${flowerId} с загаловком: ${title}`);
        return response.status(201).json(inforow);
        }
    catch(error: any){
        return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
        }
    }

    async getAll(request: Request<{}, {},{}, GetAllInfoQuery>, response: Response, next: NextFunction): Promise<Response | void>{
        try{

            var {flowerId, limit:queryLimit, page:queryPage} = request.query;
            if(!flowerId)
                return next(ApiError.badRequest('Параметр flowerId обязателен для получения описаний'));
    
            const page = Math.max(1, Number(queryPage) || 1);
            const rawLimit = Number(queryLimit) || 9;
            const limit = rawLimit > 50 ? 9 : rawLimit; 
            const offset = (page - 1) * limit;  

            const {rows, count} = await FlowerInfo.findAndCountAll({
                where: {flowerId: Number(flowerId)},
                limit: limit,
                offset: offset,
                order: [['id', 'ASC'], ['title', 'ASC']] 
            });

            return response.json({
                total: count, // Всего товаров в базе по этому фильтру
                pages: Math.ceil(count / limit), // Сколько всего страниц получилось
                currentPage: page,
                rows: rows // Сами товары - ранее возвращали только ***rows***
            });
        }catch(error:any){
            return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
        }
    }


    async getOne(request: Request<GetOneInfoParams>, response: Response, next: NextFunction): Promise<Response | void>{
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
             return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));           
        }
    }


    async delete(request:  Request<GetOneInfoParams>, response: Response, next: NextFunction): Promise<Response | void>{
        try{
            const id = Number(request.params.id);    
            if(isNaN(id))
                return next(ApiError.badRequest('Некорректный формат ID'));


            const deletedRows = await FlowerInfo.destroy({where: {id: id}});
            if (deletedRows === 0) 
                return next(ApiError.notFound('Описание с таким ID не найдено'));
           return response.json({change: 'ok'});           
        }catch(error:any){
            return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
        }
        }

    async update(request: Request<{}, {}, ChangeInfoRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
            try{
                const {id, flowerId, title, discription} = request.body;
                if(!id || !flowerId)
                return next(ApiError.badRequest('Не корректно указан идентификатор'));

                const updateData: Partial<CreateInfoRequestBody> = {};
                if (title !== undefined) updateData.title = title;
                if (discription !== undefined) updateData.discription = discription;

                const [rowsUpdated] = await FlowerInfo.update(updateData,{where: {id: id}});

                if (rowsUpdated === 0) 
                    return next(ApiError.notFound('Описание с таким ID не найдено или данные идентичны'));

                    return response.json({change: 'ok'});           
            }catch(error:any){
                return next(ApiError.internal('Внутренняя ошибка сервера при создании описания'));
            }
        }    
}
    export default new InfoController();