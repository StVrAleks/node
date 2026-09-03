import {FlowerImgs} from '../models/models';
import ApiError from '../error/ApiError';
import { Request, Response, NextFunction } from 'express';

interface CreateImgRequestBody {
    flowerId: number,
    img: string
}

interface GetAllImgQuery {
    flowerId: number,
    limit?: string,
    page?: string
}

interface GetOneImgParams {
    id: string;
}

class ImgController{

    async create(request : Request<{}, {}, CreateImgRequestBody> , response: Response, next: NextFunction){
    try {       
        const {flowerId, img} =  request.body;
        if(!flowerId || !img)
             return next(ApiError.badRequest('Не указан идентификатор цветка или не добавлена ссылка на изображение'));

        let flrows = await FlowerImgs.create({flowerId, img});
        return response.status(201).json(flrows);
        }
     catch(error:any){
            return next(ApiError.internal('Внутренняя ошибка сервера при сохранении изображения'));
            }
    }

    async getAll(request : Request<{}, {}, GetAllImgQuery> , response: Response, next: NextFunction){
        try{
        var {flowerId} = request.query;
        if(!flowerId)
            return next(ApiError.badRequest('Параметр flowerId обязателен для получения описаний'));
        
            const rows = await FlowerImgs.findAndCountAll({where: {
                flowerId: Number(flowerId)},
                order: [['id', 'ASC']]});
            return response.json(rows);
        }catch(error:any){
            return next(ApiError.internal('Внутренняя ошибка сервера при чтении галереи изображений'));
            }
    }
    async getOne(request: Request<GetOneImgParams>, response: Response, next: NextFunction){
        try{
        const id = Number(request.params.id);

            if(isNaN(id))
                return next(ApiError.badRequest('Некорректный формат ID изображения')); 
            const rows = await FlowerImgs.findOne({where: {id}});

            if (!rows) 
                return next(ApiError.badRequest('Изображение с таким ID не найдено'));     

            return response.json(rows);
        }catch(error:any){
            return next(ApiError.internal('Внутренняя ошибка сервера при поиске изображения'));
        }
    }
    
    async delete(request: Request<GetOneImgParams>, response: Response, next: NextFunction){
             const id = Number(request.params.id);
             if(isNaN(id))
                return next(ApiError.badRequest('Некорректный формат ID'));
            try{
                if(!id)
                    return next(ApiError.internal('Не найден такой товар'));
                const deletedImgs = await FlowerImgs.destroy({where: {id: id}});

                if (deletedImgs === 0) 
                    return next(ApiError.badRequest('Картинки с таким ID не найдено'));

                    return response.json({change: 'ok'});           
            }catch(error:any){
                return next(ApiError.internal('Внутренняя ошибка сервера при удалении изображения'));
            }
        }
 
}
   export default new  ImgController();