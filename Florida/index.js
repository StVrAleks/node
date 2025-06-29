require('dotenv').config();
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const cookieParser = require('cookie-parser');
const fs = require("fs");
const PORT = process.env.PORT || 8181;
const sequelize = require('./db');

const models = require('./models/models');
const cors = require('cors');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandlingMiddleware');
const logger = require('./middleware/winston');
//const fileUpload = require('express-fileupload');
const path = require('path');
const ApiError = require('./error/ApiError');
const gm = require('gm').subClass({ imageMagick: '7+' });

const expressHbs = require("express-handlebars");
const hbs = require("hbs");
const { request } = require('http');
const { method } = require('lodash');
const multer  = require('multer');
const publicPath = path.join(__dirname, 'public');
var spawn = require('cross-spawn');

app.use(cookieParser());
app.use(cors());
app.use(express.json());
//app.use(express.static(publicPath));//path.resolve(__dirname, 'public')));


// Настройка кэширования для статики
app.use(express.static(publicPath, {
  maxAge: '1d', // Кэширование на 1 день
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png')) {
      // Задаем заголовки для изображений
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Кэширование на год
    }
  }
}));

app.use('/api', router);

app.use(errorHandler);

app.get("/home.html", function (_, response) {
    logger.info('/showAll__Открыли home.html', __dirname);
  
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'home.hbs'), 'utf8');
     const viewTemplate = hbs.handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      image: '/public/images/shop.jpg'//path.join('public', 'images', 'shop.jpg'),
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
            response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML));  

 });
app.get("/registration_user.html", function (_, response) {
    logger.info('/showAll__registration_user', __dirname);
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'registration.hbs'), 'utf8');
     const viewTemplate = hbs.handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      welcom: 'Пожалуйста, заполните форму регистрации'//path.join('public', 'images', 'shop.jpg'),
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
            response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML));  
 });

  app.get("/login_user.html", function (request, response) {
    logger.info('/showAll__login_user', __dirname);
  
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'login.hbs'), 'utf8');
     const viewTemplate = hbs.handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      welcom: 'Пожалуйста, заполните форму',//path.join('public', 'images', 'shop.jpg'),
      suc: request.query.suc|| ""
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
            response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML));  
 });

 app.get("/account.html", function (request, response) {
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'account.hbs'), 'utf8');
     const viewTemplate = hbs.handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      welcom: 'Добро пожаловать',
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
     response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
 });

app.get("/adminka.html", function (request, response) {
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'adminka.hbs'), 'utf8');
     const viewTemplate = hbs.handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      welcom: 'Добро пожаловать',
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
     response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
 });

app.get("/catalog.html", function (request, response) {
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'catalog.hbs'), 'utf8');
     const viewTemplate = hbs.handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      welcom: 'Добро пожаловать',
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
     response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
 });

 app.get("/flower.html", function (request, response) {
  var {id} = request.query;
     const viewString = fs.readFileSync(path.join(__dirname, 'views', 'flower.hbs'), 'utf8');
     const viewTemplate = hbs.handlebars.compile(viewString);
     const viewHTML = viewTemplate({
      id: id
     });
    const layoutString=fs.readFileSync(path.join(__dirname, 'views','layouts','main.hbs'),"utf8");
     response.send(layoutString.split("{{{ conteiner }}}").join(viewHTML)); 
 });

 
const publicPathM = path.join(__dirname,  'pictures');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicPathM); // Папка для сохранения файлов
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname); // Получаем расширение из оригинального имени файла
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({ storage: storage });
const serviceDownFiles = upload.fields([{name:'file', maxCount:1}]);


app.options("/uploads", function (request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.send(); 
});


//загрузка файла на сервер
app.post("/uploads", serviceDownFiles , async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    let file0 = req.files.file[0]['originalname'];
    if (!req.files.file[0]){
         console.log("No file uploaded");
         image = "noimage.jpg";
         const mis = 'Файл не найден';
         res.send.json({mis});      
    }
   console.log("Uploading file...");
   image = req.files.file[0]["filename"];
  
let oldPath = path.join(__dirname,  'pictures', image);
let newPath = path.join(__dirname,  'public', 'imgStoreMINI', image);
let newPathBig = path.join(__dirname,  'public', 'imgStore', image);

await gm(oldPath)
    .resize(200, 200, '!') 
    .background('#FFF')
    .write(newPath, function (error) {
       if (error) 
        {
          logger.error('/gm ', error.message);
          next(error);}
       console.log('ok');
    });
await gm(oldPath)
    .resize(400, 600, '!') 
    .background('#FFF')
    .write(newPathBig, function (error) {
    if (error) 
        {
          logger.error('/gm ', error.message);
          next(error);
        }
       console.log('ok');
      fs.unlink(oldPath, (error) => {
       if (error) 
        {
          logger.error('/unlink ', error.message);
          next(error);
        }
       console.log('Deleted');
});
});    

res.send(image);  
});

app.post("/deleteImg", async function (request, response, next) {
  const {name} = request.body;
  try{
      if(!name)
          return next(ApiError.internal('Картинка не была удалена'));
      let newPath = path.join(__dirname,  'public', 'imgStoreMINI', name);
      let newPathBig = path.join(__dirname,  'public', 'imgStore', name);

      fs.unlink(newPath, (err) => {
       if (err) next(err);})
      fs.unlink(newPathBig, (err) => {
       if (err) next(err);})        
          return response.json({change: 'ok'});           
   }catch(error){
    next(error);
  }
});

const start = async () => {
    try{
           await sequelize.authenticate();
           await sequelize.sync();
         //  await sequelize.sync({ alter: true }); 
          // app.listen(PORT, ()=> console.log('server start'));
    } 
    catch (e){
        console.log(e);
    }
}
start();
app.listen(PORT, ()=> console.log('server start'));