import { Flowers } from '../models/models';
import ApiError from '../error/ApiError';
import logger from '../middleware/winston';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

interface CreateFlowerRequestBody {
    name: string,
    price: number,
    vidId: number,
    mKeyWords?: string | undefined,
    mDiscript?: string | undefined
};
interface UpdateFlowerRequestBody extends Partial<CreateFlowerRequestBody> {
    id: number;
}

interface DeleteFlowerRequestBody {
    id: number;
}

interface GetAllFlowersQuery {
    vidId?: string;
    limit?: string;
    page?: string;
}

type GetOneFlowerParams = ParamsDictionary & {
    id?: string;
};

class FlowerController{

    async create(request: Request<{}, {}, CreateFlowerRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
        try {       
            const {name, price, vidId, mKeyWords, mDiscript} =  request.body;
            //создаем строку с цветком
            logger.info(`/создали новый цветок: ${name}`);

            const flower = await Flowers.create({name, price, vidId: vidId, mKeyWords, mDiscript});
            return response.status(201).json(flower);
            }
        catch(error: any){
            return next(ApiError.internal('Ошибка сервера при выполнении запроса.'));
                }
    }

    async getAll(request: Request<{}, {}, {}, GetAllFlowersQuery>, response: Response, next: NextFunction): Promise<Response | void>{
       try{ 
            var {vidId, limit: queryLimit, page: queryPage} = request.query;
            const page = Number(queryPage) || 1;
            const limit = Number(queryLimit) || 9;
            const offset = (page - 1) * limit;
            const whereCondition: { vidId?: number } = {};

            if (vidId) 
                whereCondition.vidId = Number(vidId);

            // findAndCountAll возвращает { count: number, rows: Flower[] }
            const flowersData = await Flowers.findAndCountAll({
                where: whereCondition,
                limit: limit,
                offset: offset,
                // сортировку по цене или ID:
                order: [['id', 'ASC'],['price', 'ASC'], ['name', 'ASC']] 
            });

            // Возвращаем фронтенду и данные, и мета-информацию для отрисовки страниц
            return response.json({
                total: flowersData.count, // Всего товаров в базе по этому фильтру
                pages: Math.ceil(flowersData.count / limit), // Сколько всего страниц получилось
                currentPage: page,
                rows: flowersData.rows // Сами товары - ранее возвращали только ***rows***
            });
        }catch(error: any){
            return next(ApiError.internal('Ошибка сервера при выполнении запроса'));
        }
    }

    async getOne(request: Request<GetOneFlowerParams>, response: Response, next: NextFunction): Promise<Response | void>{
        const id = Number(request.params.id);
        if(isNaN(id))
            return next(ApiError.badRequest('Некорректный формат ID'));
        try {           
            const flower = await Flowers.findOne({ where: { id } });
            
            // Если база ответила успешно, но вернула null — вот теперь товара нет
            if (!flower) {
                return next(ApiError.notFound('Товар с таким ID не найден')); 
            }

        return response.json(flower);
        }    
        catch(error: any){
               return next(ApiError.internal('Ошибка сервера при выполнении запроса'));
        }

    }

    async change(request: Request<{}, {}, UpdateFlowerRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
        const {id, name, price, vidId, mKeyWords, mDiscript} = request.body;
        try{
            if(!id)
                return next(ApiError.badRequest('Не найден такой цветок'));

            const updateData: Partial<CreateFlowerRequestBody> = {};
            if (name !== undefined) updateData.name = name;
            if (price !== undefined) updateData.price = price;
            if (vidId !== undefined) updateData.vidId = vidId;
            if (mKeyWords !== undefined) updateData.mKeyWords = mKeyWords;
            if (mDiscript !== undefined) updateData.mDiscript = mDiscript;

            const [rowsUpdated] = await Flowers.update(updateData, { where: { id } });
            
            if (rowsUpdated === 0) {
                return next(ApiError.notFound('Цветок с таким ID не найден или данные идентичны'));
            }
            return response.json({ change: 'ok' });               
        }catch(error: any){
               return next(ApiError.internal('Ошибка сервера при обновлении товара'));
        }
    }

    async delete(request: Request<GetOneFlowerParams>, response: Response, next: NextFunction): Promise<Response | void>{
    try{
        const id = Number(request.params.id);    
        if(isNaN(id))
            return next(ApiError.badRequest('Идентификатор ID обязателен для удаления товара'));


        const deletedRowsCount = await Flowers.destroy({ where: { id } });

        if (deletedRowsCount === 0) {
            return next(ApiError.notFound('Товар с таким ID не найден для удаления'));
        }

        return response.json({ change: 'ok' });

        }catch(error: any){
            return next(ApiError.internal('Ошибка сервера при удалении товара'));
        }
    }
}
    export default new FlowerController();