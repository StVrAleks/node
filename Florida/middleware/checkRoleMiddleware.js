const jwt = require('jsonwebtoken');

module.exports = function (role, next){
    return function(request, response, next){
          if(request.method === 'OPTIONS')
        next();
    try{
        const token = request.headers.authorization.split(' ')[1];
        if(!token)
            return response.status(401).json({message: 'Не авторизован'});
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(decoded.role != role){
             return response.status(403).json({message: 'Нет доступа'});
        }
        request.user = decoded;
        next();
    } catch(er){
        response.status(401).json({message: 'Не авторизован'});
    } 
    }
 
}