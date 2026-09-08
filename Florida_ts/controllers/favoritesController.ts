import { Favorite } from '../models/models';
import ApiError from '../error/ApiError';
import logger from '../middleware/winston';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

interface CreateFavoritesRequestBody {
    userId: number,
    flowerId: number;
}
interface GetAllFavoritesRequestBody {
    userId: number,
    limit?: string,
    page?: string
}

type GetOneFavoriteParams = ParamsDictionary & {
    id?: string;
};

class FavoritesController {
    async create(request: Request<{}, {}, CreateFavoritesRequestBody>,  response: Response, next: NextFunction): Promise<Response | void>{
        const { userId, flowerId } = request.body;
        try{
            if(!userId || !flowerId)
                return next(ApiError.badRequest('Не заполнено поле "userId" или "flowerId"'));

            const alreadyExists = await Favorite.findOne({ where: { userId, flowerId } });
            if (alreadyExists) {
                return next(ApiError.badRequest('Этот товар уже находится в избранном'));
            }

            const favorite = await Favorite.create({ userId, flowerId });
            logger.info(`/пользователь с Ид: ${userId} добавил в избранное товар с Ид ${flowerId}`);
            return response.status(201).json(favorite);
        }    
        catch(error: any){
               return next(ApiError.badRequest('Внутренняя ошибка сервера при создании категории'));
        }
    }

    async getAll(request: Request<{}, {}, {}, GetAllFavoritesRequestBody>,  response: Response, next: NextFunction): Promise<Response | void>{
        let {userId, limit: queryLimit, page: queryPage} = request.query;
        const page = Math.max(1, Number(queryPage) || 1);
        const rawLimit = Number(queryLimit) || 9;
        const limit = rawLimit > 50 ? 9 : rawLimit; 
        const offset = (page - 1) * limit;

        if(!userId)
            return next(ApiError.badRequest('Не заполнено поле "userId"'));
        try{
            const { rows, count } = await Favorite.findAndCountAll({
            where: {userId: Number(userId)}, 
                limit: limit,
                offset: offset,
                // сортировка
                order: [['id', 'ASC'], ['flowerId', 'ASC']] 
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


    async delete(request:  Request<GetOneFavoriteParams>,  response: Response, next: NextFunction): Promise<Response | void>{
        
        try{
            const id = Number(request.params.id);    
            if(isNaN(id))
                return next(ApiError.badRequest('Некорректный формат ID'));

           const deletedRows = await Favorite.destroy({where: {id: id}});
            if (deletedRows === 0) {
                return next(ApiError.badRequest('Товар с таким ID не найдена'));
            }           
                return response.json({change: 'ok'});            
        }catch(error){
            return next(ApiError.internal('Ошибка сервера при выполнении запроса'));}
    }


    async getOne(request: Request<GetOneFavoriteParams>,  response: Response, next: NextFunction): Promise<Response | void>
        {
        try{ 
        const id = Number(request.params.id);

        if(isNaN(id))
            return next(ApiError.badRequest('Некорректный формат ID'));       
        const rows = await Favorite.findOne({where: {id}});
        if (!rows) 
            return next(ApiError.badRequest('Товар с таким ID не найден в избранном')); 
        return response.json(rows);
        }
        catch(error){ return next(ApiError.internal('Ошибка сервера при выполнении запроса')); }
        }
} 
export default new FavoritesController();
