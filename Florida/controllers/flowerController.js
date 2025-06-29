const path = require('path');
const {Flowers, FlowerInfo} = require('../models/models');
const ApiError = require('../error/ApiError');
const { query, where } = require('../db');
const logger = require('../middleware/winston');

class FlowerController{
    async create(request, response, next){
  try {       
        const {name, price, vidId, mKeyWords, mDiscript} =  request.body;
        //создаем строку с цветком
        logger.info('/создали новый цветок ', name);
        const flower = await Flowers.create({name, price, 'flowerVidId': vidId, mKeyWords, mDiscript});
        return response.json(flower);
        }
     catch(error){
        logger.error('/create ', error.message);
        next(ApiError.badRequest(error.message));
         }
    }
    async getAll(request, response, next){
        var {vidId, limit, page} = request.query;
        page = page || 1;
        limit = limit || 30;
        let offset = page * limit - limit;
        var rows;
        if(!vidId){
            rows = await Flowers.findAndCountAll({limit, offset});
        }
        if(vidId){
            rows = await Flowers.findAndCountAll({where:{vidId}, limit, offset});
        }
        return response.json(rows);
    }
    async getOne(request, response, next){
        const {id} = request.body;
        const rows = await Flowers.findOne(
            {where: {id}});
        return response.json(rows);
    }
       async change(request, response, next){
            const {id, name, price, vidId, mKeyWords, mDiscript} = request.body;
            try{
                if(!name)
                    return next(ApiError.internal('Не найден такой id'));
                await Flowers.update({name, price, 'flowerVidId':vidId, mKeyWords, mDiscript},
                        {where: {id: id}});
                    return response.json({change: 'ok'});           
            }catch(error){
                logger.error('/change ', error.message);
                next(error);
            }
        }
        async delete(request, response, next){
            const {id} = request.body;
            try{
                if(!id)
                    return next(ApiError.internal('Не найден такой товар'));
                await Flowers.destroy({where: {id: id}});
                    return response.json({change: 'ok'});           
            }catch(error){
                logger.error('/delete ', error.message);
                next(error);
            }
        }
}
    module.exports = new FlowerController();