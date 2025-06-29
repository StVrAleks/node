const path = require('path');
const {Flowers, FlowerInfo} = require('../models/models');
const ApiError = require('../error/ApiError');
const { query, where } = require('../db');
const logger = require('../middleware/winston');

class InfoController{
    async create(request, response, next){
  try {       
        const {flowerId, title, discription} =  request.body;
          let inforow = await FlowerInfo.create({flowerId, title, discription});
        return response.json(inforow);
        }
     catch(error){
        logger.error(Date.now(), '/create ', error.message);
        next(ApiError.badRequest(error.message));
         }
    }
    async getAll(request, response, next){
        try{
        var {flowerId, limit, page} = request.body;
        page = page || 1;
        limit = limit || 30;
        let offset = page * limit - limit;
        var rows;
        console.log('flowerId',flowerId);
            rows = await FlowerInfo.findAndCountAll({where: {flowerId}});
           // if(!rows)
           //     rows = 0;
        return response.json(rows);
        }catch(error){
            logger.error('/getAll ', error.message);
            next(ApiError.badRequest(error.message));
         }
    }
    async getOne(request, response, next){
        const {flowerId} = request.params;
        const rows = await FlowerInfo.findAndCountAll(
            {where: {flowerId}}
        );
        return response.json(rows);
    }
    async delete(request, response, next){
            const {id, flowerId} = request.body;
            try{
                if(!id)
                    return next(ApiError.internal('Не найден такой товар'));
                await FlowerInfo.destroy({where: {id: id}});
                    return response.json({change: 'ok'});           
            }catch(error){
                logger.error('/delete ', error.message);
                next(error);
            }
        }
        async update(request, response, next){
            const {id, flowerId, title, discription} = request.body;
            try{
                if(!id)
                    return next(ApiError.internal('Не найден такой товар'));
                await FlowerInfo.update({flowerId:flowerId, title:title, discription:discription},{where: {id: id}});
                    return response.json({change: 'ok'});           
            }catch(error){
                logger.error('/update ', error.message);
                next(error);
            }
        }    
}
    module.exports = new InfoController();