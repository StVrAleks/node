import { BasketFlower } from '../models/models';
import ApiError from '../error/ApiError';
import logger from '../middleware/winston';
import { Request, Response, NextFunction } from 'express';


    interface CreateBasketRequestBody {
        basketId: number,
        flowerId: number,
        quantity: number
    };

    interface UpdateBasketRequestBody extends Partial<CreateBasketRequestBody> {
        id: number;
        quantity: number;
    }

    interface DeleteBasketRequestBody {
        id: number;
    }

    interface GetAllBasketQuery {
        basketId?: string;
    }

    interface GetOneBasketParams {
        id: string; // В Express все параметры URL всегда строки!
    }

class FlowerController{

    async create(request: Request<{}, {}, CreateBasketRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
    try {       
        const { basketId, flowerId, quantity} =  request.body;
        if( !basketId || !flowerId)
            return next(ApiError.badRequest('Поля basketId и flowerId должны быть заполнены обязательно'));
        if(quantity !== undefined && quantity < 0)
            return next(ApiError.badRequest('Количество товара не может быть отрицательным числом'));
        //создаем строку с цветком
        logger.info(`/создали новую позицию в карзине: ${basketId}`);
        
        const rowBascet = await BasketFlower.create({basketId, flowerId, quantity});
        return response.status(201).json(rowBascet);
        }
    catch(error: any){
            return next(ApiError.internal('Ошибка сервера при удалении товара'));
        }
    }

    async getAll(request: Request<{}, {}, {}, GetAllBasketQuery>, response: Response, next: NextFunction){
        try {  
            var basketId = request.query;
            if( !basketId )
                return next(ApiError.badRequest('Поле Id должны быть заполнены обязательно'));

            // Делаем ОДИН запрос к базе
        const basketRows = await BasketFlower.findAndCountAll({
            where: {basketId: Number(basketId)},
            // сортировку по цене или ID:
            order: [['id', 'ASC']] 
        });

        // Возвращаем фронтенду и данные, и мета-информацию для отрисовки страниц
        return response.json({
            total: basketRows.count, // Всего товаров в базе по этому фильтру
            rows: basketRows.rows // Сами товары в корзине
        });
        }
    catch(error: any){
            return next(ApiError.internal('Ошибка сервера при получении содержимого корзины'));
        }
    }

    async getOne(request: Request<GetOneBasketParams>, response: Response, next: NextFunction){
        try { 
            const id = Number(request.params.id);

        if(isNaN(id))
            return next(ApiError.internal('Некорректный формат ID позиции корзины'));
                  
            const basketRow = await BasketFlower.findOne({ where: { id } });
            
            // Если база ответила успешно, но вернула null — вот теперь товара нет
            if (!basketRow) {
                return next(ApiError.internal('Товар с таким ID не найден')); 
            }

        return response.json(basketRow);
        }    
        catch(error: any){
               return next(ApiError.internal('Ошибка сервера при выполнении запроса'));
        }

    }

    async change(request: Request<{}, {}, UpdateBasketRequestBody>, response: Response, next: NextFunction){
        const {id, quantity } = request.body;
        try{
            if(!id)
                return next(ApiError.internal('Не найден такой цветок'));

            const updateData: Partial<CreateBasketRequestBody> = {};

            if (quantity !== undefined) updateData.quantity = quantity;

            const [rowsUpdated] = await BasketFlower.update(updateData, { where: { id } });
            
            if (rowsUpdated === 0) {
                return next(ApiError.badRequest('Цветок с таким ID не найден или данные идентичны'));
            }
            return response.json({ change: 'ok' });               
        }catch(error: any){
               return next(ApiError.internal('Ошибка сервера при обновлении товара'));
        }
    }

    async delete(request: Request<{}, {}, DeleteBasketRequestBody>, response: Response, next: NextFunction){
        const {id} = request.body;
        try{
            if(!id)
                return next(ApiError.internal('Идентификатор ID обязателен для удаления товара'));
        const deletedRowsCount = await BasketFlower.destroy({ where: { id } });

        if (deletedRowsCount === 0) {
            return next(ApiError.badRequest('Товар с таким ID не найден для удаления'));
        }

        return response.json({ change: 'ok' });

        }catch(error: any){
            return next(ApiError.internal('Ошибка сервера при удалении товара'));
        }
    }
}
    export default new FlowerController();