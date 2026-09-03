const jwt = require('jsonwebtoken');

module.exports = function (request, response, next){
    if(request.method === 'OPTIONS')
        next();
    try{
        //const token = request.headers.authorization.split(' ')[1];
        const authUser = {'authName':'', 'authEmail':''};
        const token = request.headers.authorization.split(' ')[1];
       // console.log('token', token);
        if(!token)
            return response.status(401).json({message: 'Не авторизован'});
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
       // console.log(decoded);
        request.user = decoded;
        authUser['authName'] = decoded.name;
        authUser['authEmail'] = decoded.email;
        response.json({authUser});
        next();
    } catch(er){
        response.status(401).json({message: 'Не авторизован'});
    }
}