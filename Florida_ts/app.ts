import 'dotenv/config';
import express from "express"; // получаем модуль express
const app = express();// создаем приложение express
const PORT = process.env.PORT || 8181;
import { Request, Response, NextFunction } from 'express';
import cookieParser  from 'cookie-parser';
import fs  from "fs";
import path  from 'path';
import cors  from 'cors';
import Handlebars from 'handlebars'; 
import logger  from './middleware/winston';
import gmLib from 'gm';
const gm = require('gm').subClass({ imageMagick: '7+' });

import  expressHbs  from "express-handlebars";
import  hbs  from "hbs";
import  multer   from 'multer';
import spawn from 'cross-spawn';

import sequelize  from './db';
import router  from './routes/index';
import errorHandler  from './middleware/errorHandlingMiddleware';
import authMiddleware from './middleware/authMiddleware';

import ApiError  from './error/ApiError';
import { promises as fsPromises } from 'fs';

const publicPath = path.join(__dirname, 'public') as string;
import cabinetController from './controllers/CabinetController';

router.get('/cabinet', authMiddleware, cabinetController.renderCabinet);

app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Настройка кэширования для статики
app.use(express.static(publicPath, {
  maxAge: '1d', // Кэширование на 1 день
  setHeaders: (res:Response, path:string) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {
      // Задаем заголовки для изображений
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Кэширование на год
    }
  }
}));
app.use('/api', router);

app.use(errorHandler);

app.get("/home.html", function (request: Request, response: Response, next: NextFunction) {
  try{
    logger.info('/showAll__Открыли home.html', { dirname: __dirname });
    const user = request.query.user as string;
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'home.hbs'), 'utf8') as string;
     const viewTemplate: Handlebars.TemplateDelegate = Handlebars.compile(viewString);
     const viewHTML = viewTemplate({
        image: '/public/images/shop.jpg'
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8") as string;
    const layoutTemplate: Handlebars.TemplateDelegate = Handlebars.compile(layoutString);    
    const finalHTML = layoutTemplate({
      conteiner: viewHTML, 
      user: request.user   
    });
    
    return response.send(finalHTML);  
    }
    catch(err:any){
      return next(err);
    }
 });

app.get("/registration_user.html", function (request: Request, response: Response, next: NextFunction) {
  try{
    logger.info('/showAll__registration_user',{ dirname: __dirname });

     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'registration.hbs'), 'utf8') as string;
     const viewTemplate: Handlebars.TemplateDelegate = Handlebars.compile(viewString);
     const viewHTML = viewTemplate({
          welcom: 'Пожалуйста, заполните форму регистрации'
        });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8") as string;
            response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML));  
  }
  catch(err){
      return next(err);
  }        
 });

app.get("/login_user.html", function (request: Request, response: Response, next: NextFunction) {
    try{
      logger.info('/showAll__login_user', { dirname: __dirname });
    
      const viewString = fs.readFileSync(path.join(__dirname, 'views', 'login.hbs'), 'utf8');
      const viewTemplate: Handlebars.TemplateDelegate = Handlebars.compile(viewString);
      const viewHTML = viewTemplate({
          welcom: 'Пожалуйста, заполните форму',
          suc: request.query.suc|| ""
      });
      const layoutString = fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8") as string;
              response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML));  
    } catch(err: any){
        return next(err);
    }
});

 app.get("/account.html", authMiddleware(), function (request: Request, response: Response, next: NextFunction) {
  try{
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'account.hbs'), 'utf8') as string;
     const viewTemplate: Handlebars.TemplateDelegate = Handlebars.compile(viewString);
     const viewHTML = viewTemplate({
            welcom: 'Добро пожаловать в личный кабинет',
     });
     const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8") as string;
     return response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
  }
  catch(err){
     return next(err);
  } 
 });

app.get("/adminka.html", authMiddleware('ADMIN'), function (request: Request, response: Response, next: NextFunction) {
  try{
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'adminka.hbs'), 'utf8');
     const viewTemplate: Handlebars.TemplateDelegate = Handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      welcom: 'Добро пожаловать в центр администрирования сайтом',
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'), "utf8");
     response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
  }
  catch(err){
     return next(err);
  } 
 });

app.get("/catalog.html", function (request: Request, response: Response, next: NextFunction) {
  try{
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'catalog.hbs'), 'utf8');
     const viewTemplate: Handlebars.TemplateDelegate = Handlebars.compile(viewString);
     const viewHTML = viewTemplate({
        welcom: 'Добро пожаловать в каталог',
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
     response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
  }
  catch(err){
    return next(err);
  } 
 });

 app.get("/flower.html", function (request: Request, response: Response, next: NextFunction) {
  try{
     const id = request.query.id as string;
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'flower.hbs'), 'utf8');
     const viewTemplate: Handlebars.TemplateDelegate = Handlebars.compile(viewString);
     const viewHTML = viewTemplate({
           id: id
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
     response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
    }
  catch(err){
    return next(err);
  }  
 });

 
const publicPathM : string = path.join(__dirname,  'pictures');

const storage = multer.diskStorage({
  destination: function (req : Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, publicPathM); // Папка для сохранения файлов
      },
  filename: function (req : Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix : string = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension : string = path.extname(file.originalname); // Получаем расширение из оригинального имени файла
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({ storage: storage });
const serviceDownFiles = upload.fields([{name:'file', maxCount:1}]);


app.options("/uploads",  function (request: Request, response: Response, next: NextFunction) {
  try{  
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        
      return response.sendStatus(204);
  }
  catch(err){
    return next(err);    
  }  
});

type MulterFields = {
    [fieldname: string]: Express.Multer.File[];
};

//загрузка файла на сервер
app.post("/uploads", authMiddleware('ADMIN'), serviceDownFiles , async function (req: Request, res: Response, next: NextFunction) {
try{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    const files = req.files as MulterFields | undefined;

    if (!files || !files['file'] || files['file'].length === 0) {
      console.log("No file uploaded");
      return next(ApiError.internal('Ошибка сервера: Файл не найден'));
    }

    const fileData = files['file'][0];
    const image: string = fileData.filename;

   // let file0 = req.fileData['originalname'];

    console.log("Uploading file...");
 //   image = req.files.file[0]["filename"];
    
  let oldPath = path.join(__dirname,  'pictures', image);
  let newPath = path.join(__dirname,  'public', 'imgStoreMINI', image);
  let newPathBig = path.join(__dirname,  'public', 'imgStore', image);

await new Promise<void>((resolve, reject) => {  
  gm(oldPath)
      .resize(200, 200, '!') 
      .background('#FFF')
      .write(newPath, function (error : Error) {
        if (error) 
          {
            logger.error('/gm MINI error: ', error.message);
            return reject(error);
            console.log('MINI image ok');
            resolve();
      }});
    });
await new Promise<void>((resolve, reject) => {  
 gm(oldPath)
      .resize(400, 600, '!') 
      .background('#FFF')
      .write(newPathBig, function (error : Error) {
      if (error) 
          {
            logger.error('/gm ', error.message);
            return reject(error);
          }
        console.log('BIG image ok');
        fs.unlink(oldPath, (error) => {
          if (error) 
            logger.error('/unlink ', error.message);
          else
            console.log('Original temp file deleted');
      });
    resolve();  
  });    
});
res.send(image);  
} catch(error : any) {
    return next(error);
}
});

app.post("/deleteImg", authMiddleware('ADMIN'), async function (request:Request, response: Response, next: NextFunction) {
  try{  
      const {name} = request.body;
      if(!name)
          return next(ApiError.internal('Картинка не была удалена: не указано имя файла'));

      let newPath : string = path.join(__dirname,  'public', 'imgStoreMINI', name);
      let newPathBig : string = path.join(__dirname,  'public', 'imgStore', name);


      try {
          await fsPromises.unlink(newPath);
      } catch (err: any) {
          logger.error(`Ошибка удаления MINI картинки ${name}:`, err.message);
      }

      try {
          await fsPromises.unlink(newPathBig);
      } catch (err: any) {
          logger.error(`Ошибка удаления BIG картинки ${name}:`, err.message);
      }
       
      return response.json({change: 'ok'});           
   }catch(error : any){
      next(error);
  }
});

const start = async () => {
    try{
        await sequelize.authenticate();
        logger.info('База данных успешно подключена (Sequelize authenticated).');
        await sequelize.sync();
        logger.info('Таблицы базы данных успешно синхронизированы.');

        app.listen(PORT, ()=> { 
        logger.info(`=== Сервер Flowerida успешно запущен на порту ${PORT} ===`); 
        console.log('server start')
      });

    } 
    catch (e : any){
        logger.error('Критическая ошибка при запуске сервера Flowerida:', e.message);
        console.error(e);
    }
}
start();

