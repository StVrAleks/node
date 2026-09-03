const ApiError = require('../error/ApiError');
const sha256 = require('js-sha256');
const jwt = require('jsonwebtoken');


const {User, Bascet} = require('../models/models');

const nodemailer = require('nodemailer');
const mailServise = require('../service/user_mail');
const logger = require('../middleware/winston');


const generateJWT = (id, name, email, role) =>{
  return  jwt.sign(
            {id, name, email, role},
             process.env.SECRET_KEY,
             {expiresIn: '24h'});
};

class userController{
    async registration(request, response, next){
        const{userName, email, password} = request.body;
        try{
        logger.info('регистрация пользователя', userName);
        if(!email ||!userName || !password)
            return next(ApiError.badRequest('Не верный email или пароль'));

        console.log('проверка на email');
        var candidate =  await User.findOne({
                        where: {
                                email: email
                                }
        });
        console.log('candidate', candidate);
        if(candidate !== null)
            return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        
        logger.info('прошла проверка на email', email);

        const userPas = password + process.env.SALT;
        const hashPassword = sha256(userPas);
        logger.info('Закешировали пароль, создаем юсера');
        console.log('Закешировали пароль, создаем юсера');
        try{
        const user = await User.create({name:userName, email:email, password:hashPassword});
        }  catch (e) {
            console.log(e);
            next(e);}
        let verificationLink = `http:\/\/localhost:8181\/api/user/verify?email=${email}`;
        console.log('Сделали ссылку, отправляем почту');
        await mailServise.sendActivationMail(email, userName, verificationLink);
        logger.info('отправляем почту с активацией');   
        const statusUser = userName + `, на указанную вами почту было отправлено письмо с подтверждением на регистрацию.`;    
        return response.json({statusUser});       
    } catch (e) {
        logger.error('/не смогли найти данные по цветку ', error.message);
        next(e);}
}

    async login(request, response, next){
        const {email, password} = request.body;
        logger.info('авторизация пользователя', email);
        try{
        const user = await User.findOne({where: {email:email}});
        if(user === null)
            return next(ApiError.internal('Пользователь с таким email и паролем не найден'));

        const userPas = password + process.env.SALT;
        const hashPassword = sha256(userPas);
        if(hashPassword != user.password)
            return next(ApiError.internal('Пользователь с таким email и паролем не найден'));
       
        
        const basket = await Bascet.findOne({where: {userId: user.id}});
         if(!basket.userId)
             await Bascet.create({userId: user.id});
        const token = generateJWT(user.id,user.name, user.email, user.role);
        response.statusCode = 302;
        response.setHeader('Content-Type', 'text/html');
        //response.setHeader('authorization', 'Bearer '+ token);
       // response.cookie('tokenJWT', token, {maxAge: 24*60*60*1000, httpOnly:true});
       // let userLink = `/home.html`; 
        return response.json({key: 'Bearer '+ token});
        } catch (error){
            logger.error('/registration ', error.message);
            next(error);
            }

    }

    async check(request, response, next){
        const token = generateJWT(request.user.id, request.user.name, request.user.email, request.user.role);
       return response.json({token});
    }

  async verify (request, response, next) {
    const emailUser = request.query.email;
    const user = await User.findOne({where: {email: emailUser}});
    try{
     if(user)   
        {
        if(Math.floor(Date.now() / 1000) - user.created_user < 3600)
            {
                await User.update({user_status: 'enable'},
                                {where: {email: emailUser}});
                let userLink = `/login_user.html?suc=${user.userName}, вы успешно зарегистированы на сайте.`;                                
                response.statusCode = 200;
                response.setHeader('Content-Type', 'text/html');
                response.redirect(userLink); 
            }
            else{
                return next(ApiError.internal('Регистрация не подтверждена. Попробуйте еще раз'));
            }
        }
       else{
         return next(ApiError.internal('Пользователь с таким логином и паролем не найден.'));
       } 
    } catch (error){
        logger.error('/verify ', error.message);
        next(error);
    }
  }
  async logout(request, response, next){
    try{
        const token = request.cookie;
        response.clearCookie('tokenJWT');
        return response.json('Разлогинилcя');
    } catch (error){
        logger.error('/logout ', error.message);
        next(error);
    }
  }
  async allUsers(request, response, next){
    var {limit, page} = request.query;
        page = page || 1;
        limit = limit || 30;
        let offset = page * limit - limit;
    try{
        const { rows, count } =  await User.findAndCountAll({
            attributes: ['name', 'email', 'role', 'user_status'], 
            limit, offset});
        if(rows === null)
            return next(ApiError.badRequest('Ничего не найдено'));
        else{
            return response.json({rows});
        } 

    } catch (error){
        logger.error('/allUsers ', error.message);
        next(error);
    }
  }

  async changeUser(request, response, next){
    const {email, role} = request.body;
    try{
        if(!email || !role)
            return next(ApiError.internal('Пользователь с таким email и паролем не найден'));
        console.log(email, role);
        await User.update({role: role},
                   {where: {email: email}});
            return response.json({change: 'ok'});           
    }catch(error){
        logger.error('/changeUser ', error.message);
         next(error);
    }
  }

  async authUser(request, response, next){
  
    try{
       
    }catch(error){
        logger.error('/authUser ', error.message);
         next(error);
    }
  }
 
}
module.exports = new userController();