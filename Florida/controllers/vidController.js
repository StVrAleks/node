const {Vid} = require('../models/models');
const ApiError = require('../error/ApiError');


    class VidController {
        async create(request, response, next){
            const {name} = request.body;
            try{
                if(!name)
                    return next(ApiError.badRequest('Не заполнено поле "name"'));
                    const vid = await Vid.create({name});
                        return response.json(vid);
           } catch (e){
            logger.error('/create ', error.message);
             next(e);}
        }
        async getAll(request, response, next){
             var {limit, page} = request.query;
            page = page || 1;
            limit = limit || 30;
            let offset = page * limit - limit;
            try{
                const { rows, count } = await Vid.findAndCountAll({
                attributes: ['id', 'name'], 
                limit, offset});
                if(count === 0)
                    return next(ApiError.badRequest('Ничего не найдено'));
                else{
                    return response.json({rows});
                } 
            }catch (error){
                logger.error('/getAll ', error.message);
                next(error);}
        }
        async change(request, response, next){
            const {name, id} = request.body;
            try{
                if(!name)
                    return next(ApiError.internal('Не найден такой id'));
                await Vid.update({name: name},
                        {where: {id: id}});
                    return response.json({change: 'ok'});           
            }catch(error){
                logger.error('/change ', error.message);
                next(error);
            }
        }
        async delete(request, response, next){
            const {id, flowerId} = request.body;
            try{
                if(!id)
                    return next(ApiError.internal('Не найден такой вид'));
                if(!flowerId)
                  {
                    await Vid.destroy({where: {id: id}});
                        return response.json({change: 'ok'});     
                  }
                 else{
                    await Vid.destroy({where: {flowerId: flowerId}});
                        return response.json({change: 'ok'});     
                 }            
            }catch(error){
                logger.error('/delete ', error.message);
                next(error);
            }
        }
        async getOne(request, response, next)
        {
        try{    
        const {id} = request.body;
        const rows = await Vid.findOne({where: {id}});
        return response.json(rows);
        }catch(error){
            logger.error('/getOne ', error.message);
            next(error);
                }
        }
    }
    module.exports = new VidController();
