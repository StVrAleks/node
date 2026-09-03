import {Vid} from '../models/models';
import ApiError from '../error/ApiError';
import { Request, Response, NextFunction } from 'express';

interface CreateCategoryRequestBody {
    name: string;
}
interface GetAllCategoryRequestBody {
    limit?: string,
    page?: string
}

interface ChangeCategoryRequestBody {
    id: number,
    name: string
}

interface GetOneCategoryParams {
    id: string;
}

class VidController {
    async create(request: Request<{}, {}, CreateCategoryRequestBody>,  response: Response, next: NextFunction): Promise<Response | void>{
        const {name} = request.body;
        try{
            if(!name)
                return next(ApiError.badRequest('Не заполнено поле "name"'));
            const vid = await Vid.create({name});
            return response.status(201).json(vid);
        }    
        catch(error: any){
               return next(ApiError.badRequest('Внутренняя ошибка сервера при создании категории'));
        }
    }

    async getAll(request: Request<{}, {}, {}, GetAllCategoryRequestBody>,  response: Response, next: NextFunction): Promise<Response | void>{
        let {limit: queryLimit, page: queryPage} = request.query;
        const page = Math.max(1, Number(queryPage) || 1);
        const rawLimit = Number(queryLimit) || 9;
        const limit = rawLimit > 50 ? 9 : rawLimit; 
        const offset = (page - 1) * limit;

        try{
            const { rows, count } = await Vid.findAndCountAll({
            attributes: ['id', 'name'], 
                limit: limit,
                offset: offset,
                // сортировка
                order: [['id', 'ASC'], ['name', 'ASC']] 
            });
            return response.json({
                total: count, // Всего товаров в базе по этому фильтру
                pages: Math.ceil(count / limit), // Сколько всего страниц получилось
                currentPage: page,
                rows: rows // Сами товары - ранее возвращали только ***rows***
                });
        }catch (error: any){
            return next(ApiError.internal('Ошибка сервера при выполнении запроса'));}
    }

    async change(request: Request<{}, {}, ChangeCategoryRequestBody>,  response: Response, next: NextFunction): Promise<Response | void>{
        const {name, id} = request.body;
        try{
            if(!id || !name)
                return next(ApiError.badRequest('Идентификатор ID и новое имя категории обязательны'));

            const [resUpdate] = await Vid.update({name: name},{where: {id: id}});

            if(resUpdate === 0){        
                return next(ApiError.badRequest('Вид с таким ID не найден'));
            }
            return response.json({ change: 'ok' });           
        }catch(error: any){
            return next(ApiError.internal('Ошибка сервера при выполнении запроса'));}
    }


    async delete(request:  Request<GetOneCategoryParams>,  response: Response, next: NextFunction): Promise<Response | void>{
        
        try{
            const id = Number(request.params.id);    
            if(isNaN(id))
                return next(ApiError.badRequest('Некорректный формат ID'));

           const deletedRows = await Vid.destroy({where: {id: id}});
            if (deletedRows === 0) {
                return next(ApiError.badRequest('Категория с таким ID не найдена'));
            }           
                return response.json({change: 'ok'});            
        }catch(error){
            return next(ApiError.internal('Ошибка сервера при выполнении запроса'));}
    }


    async getOne(request: Request<GetOneCategoryParams>,  response: Response, next: NextFunction): Promise<Response | void>
        {
        try{ 
        const id = Number(request.params.id);

        if(isNaN(id))
            return next(ApiError.badRequest('Некорректный формат ID'));       
        const rows = await Vid.findOne({where: {id}});
        if (!rows) 
            return next(ApiError.badRequest('Категория с таким ID не найдена')); 
        return response.json(rows);
        }
        catch(error){ return next(ApiError.internal('Ошибка сервера при выполнении запроса')); }
        }
} 
export default new VidController();
