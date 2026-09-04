import ApiError from '../error/ApiError';
import { sha256 } from 'js-sha256';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import {User, Basket} from '../models/models';
//import { UserAttributes } from '../models/models';

import mailServise from '../service/user_mail';
import logger from '../middleware/winston';
declare global {
    namespace Express {
        interface Request {
            user: ICurrentUser; // Добавляем свойство user в стандартный Request от Express
        }
    }
};
export interface ICurrentUser {
    id: number;
    name: string;
    email: string;
    role: string;
};

interface RegistrationUserRequestBody{
    userName: string,
    email: string,
    password: string
};

interface LoginUserRequestBody{
    email: string,
    password: string
};


interface VerifyUserQuery {
    email?:string
};

interface GetAllUsersQuery{
    limit?: string;
    page?: string;
};
interface changeRequestBody{
    email: string;
    role: string;
};

const generateJWT = (id : number, name : string, email: string, role:string) =>{
  return  jwt.sign(
            {id, name, email, role},
             process.env.SECRET_KEY,
             {expiresIn: '24h'});
};

class userController{
    // REGISTRATION: Создание пользователя + Автоматическое создание корзины
async registration(request: Request<{}, {}, RegistrationUserRequestBody>, response: Response, next: NextFunction): Promise<Response | void>{
        const{userName, email, password} = request.body;
        try{
        logger.info(`Регистрация пользователя: ${userName}`);
        if(!email ||!userName || !password)
            return next(ApiError.badRequest('Не заполнены обязательные поля (email, имя или пароль)'));

        const candidate =  await User.findOne({where: { email: email}});
        if(candidate)
            return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        

        const userPas = password + process.env.SALT || '';
        const hashPassword = sha256(userPas);

        try{
            // Создаем пользователя
        const user = await User.create({name:userName, email:email, password:hashPassword});
            //Создаем корзину ОДИН раз прямо здесь при регистрации!
       // await Basket.create({ userId: user.id });
        }  catch (e) {
         return next(ApiError.internal('Ошибка сервера при создании учетной записи или корзины пользователя'));}

        const verificationLink = `http:\/\/localhost:8181\/api/user/verify?email=${email}`;

        console.log('Сделали ссылку, отправляем почту');
        await mailServise.sendActivationMail(email, userName, verificationLink);
        logger.info('отправляем почту с активацией');   

        const statusUser = userName + `, на указанную вами почту было отправлено письмо с подтверждением на регистрацию.`;    
        return response.json({statusUser});       
    } catch (e) {
        return next(ApiError.internal('Ошибка сервера при регистрации пользователя'));}
}

async login(request: Request<{}, {}, LoginUserRequestBody>,  response: Response, next: NextFunction): Promise<Response | void>{
    const {email, password} = request.body;
    try{
    logger.info('авторизация пользователя', email);    
    const user = await User.findOne({where: {email:email}});
    if(!user)
        return next(ApiError.badRequest('Пользователь с таким email и паролем не найден'));

    const userPas = password + process.env.SALT || '';
    const hashPassword = sha256(userPas);
    if(hashPassword != user.password)
        return next(ApiError.badRequest('Пользователь с таким email и паролем не найден'));

    const basket = await Basket.findOne({where: {userId: user.id}});
    if(!basket)
        return next(ApiError.badRequest('Пользователь с таким email и паролем не найден'));

    await Basket.create({userId: user.id});

    const token = generateJWT(user.id,user.name, user.email, user.role);
    response.statusCode = 302;
    response.setHeader('Content-Type', 'text/html');
    return response.json({key: 'Bearer '+ token});
    } catch (error:any){
        return next(ApiError.internal('Ошибка сервера при попытке войти'));
        }

}

async check(request: Request<{}, {}, {}>,  response: Response, next: NextFunction): Promise<Response | void>{
        try {
            const token = generateJWT(request.user.id, request.user.name, request.user.email, request.user.role);
            return response.json({ token });
        } catch (error: any) {
            return next(ApiError.internal('Ошибка сервера при проверке авторизации'));
        }
}

async verify (request: Request<{}, {}, {}, VerifyUserQuery >,  response: Response, next: NextFunction): Promise<Response | void> {
  try{   
    const emailUser = request.query.email ? String(request.query.email) : undefined;
    if (!emailUser) {
        return next(ApiError.badRequest('Ссылка недействительна: отсутствует email'));
    }    

    const user = await User.findOne({where: {email: emailUser}});
    if (!user) {
        // Изменено на badRequest (400), так как это ошибка данных клиента
        return next(ApiError.badRequest('Пользователь с таким email не найден.'));
    }    
    
    const isLinkValid = Math.floor(Date.now() / 1000) - (user as any).created_user < 3600;
    if(isLinkValid)
        {
            await User.update(
                {user_status: 'enable'},
                {where: {email: emailUser}});
            const userName = (user as any).userName || 'Пользователь';
            const userLink = `/login_user.html?suc=${encodeURIComponent(userName)}, вы успешно зарегистрированы на сайте.`;

            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            response.redirect(userLink); 
        }
        else{
            return next(ApiError.badRequest('Время подтверждения регистрации истекло. Попробуйте еще раз.'));
        }
       
    } catch (error:any){
        return next(ApiError.internal('Ошибка сервера при регистрации пользователя'));
    }
}
async logout(request: Request<{}, {}, {}>,  response: Response, next: NextFunction): Promise<Response | void>{
try{
        response.clearCookie('tokenJWT', {
            httpOnly: true,
            secure: true, // если используете https
            sameSite: 'strict'
        });

    return response.json({ message: 'Вы успешно вышли из системы' });
    } catch (error:any){
        return next(ApiError.internal('Ошибка сервера при разъединении соединения'));
    }
}
async allUsers(request: Request<{}, {}, GetAllUsersQuery>,  response: Response, next: NextFunction): Promise<Response | void>{
try{   
const {limit: queryLimit, page: queryPage} = request.query;
const page = Math.max(1, Number(queryPage) || 1);
const rawLimit = Number(queryLimit) || 9;
const limit = rawLimit > 50 ? 9 : rawLimit; // Защита от выкачивания базы
const offset = (page - 1) * limit;

const { rows, count } =  await User.findAndCountAll({
    attributes: ['name', 'email', 'role', 'user_status'], 
    limit, offset});
    if(rows.length === 0)
        return next(ApiError.badRequest('Ничего не найдено'));
    else{
        return response.json({rows});
    } 

} catch (error){
        return next(ApiError.internal('Ошибка сервера при получении списка пользователей'));
}
}

  async changeUser(request: Request<{}, {}, changeRequestBody>,  response: Response, next: NextFunction): Promise<Response | void>{
    const {email, role} = request.body;
    try{
        if(!email || !role)
            return next(ApiError.internal('Пользователь с таким email и паролем не найден'));
        console.log(email, role);
                    const [rowsUpdated] = await User.update({ role: role }, { where: { email: email } });
            
            if (rowsUpdated === 0) {
                return next(ApiError.badRequest('Пользователь с таким email не найден или роль совпадает'));
            }
        return response.json({change: 'ok'});           
    }catch(error:any){
        return next(ApiError.internal('Ошибка сервера при изменении данных пользователя'));;
    }
  }

  async authUser(request,  response: Response, next: NextFunction): Promise<Response | void>{
  
    try{
       
    }catch(error:any){
        return next(ApiError.internal('Ошибка сервера при аутентификации пользователя'));
    }
  }
 
}
    export default  new userController();