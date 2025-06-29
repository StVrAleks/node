const path = require('path');
const {Flowers, FlowerImgs} = require('../models/models');
const ApiError = require('../error/ApiError');
const { query, where } = require('../db');
const logger = require('../middleware/winston');

class ImgController{

    async create(request, response, next){
  try {       
        const {flowerId, img, num} =  request.body;
           let flrows = await FlowerImgs.create({flowerId, img});
        return response.json(flrows);
        }
     catch(error){
        logger.error(Date.now(), '/create', error.message);
        next(ApiError.badRequest(error.message));
         }
    }
    async getAll(request, response, next){
        try{
        var {flowerId} = request.body;
        var rows;
            rows = await FlowerImgs.findAndCountAll({where: {flowerId:flowerId}});
            return response.json(rows);
        }catch(error){
            logger.error('/getAll ', error.message);
            next(ApiError.badRequest(error.message));
         }
    }
    async getOne(request, response, next){
        const {id} = request.params;
        const rows = await FlowerImgs.findOne(
            {where: {id}}
        );
        return response.json(rows);
    }
    async delete(request, response, next){
            const {id} = request.body;
            try{
                if(!id)
                    return next(ApiError.internal('Не найден такой товар'));
                await FlowerImgs.destroy({where: {id: id}});
                    return response.json({change: 'ok'});           
            }catch(error){
                logger.error('/delete ', error.message);
                next(error);
            }
        }
 
}
    module.exports = new ImgController();