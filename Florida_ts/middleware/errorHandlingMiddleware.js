const ApiError = require('../error/ApiError');

module.exports = function (error, request, response, next){
    if(error instanceof ApiError){
        return response.status(error.status).json({mes: error.mes})
    }
    return response.status(500).json({mes: "Непредвиденная ошибка!"});
}