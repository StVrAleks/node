const http = require("http");
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const fs = require("fs");
const path = require('path');
const mime = require('mime');
//const { includes, reject, result } = require("lodash");
const { error } = require("console");
//const fetch = require('node-fetch');
const urlencodedParser = express.urlencoded({extended: true});
const jsonParser = express.json();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//const EventEmitter = require('node:events');
//--********log****/
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
//*****------------- */

//logger.info('/showAll__Открыли соединение к MySQL');
//logger.error("/showAll__Ошибка при закрытии соединения:", error);

//*** handlebar */
const expressHbs = require("express-handlebars");
const hbs = require("hbs");

app.engine("hbs", expressHbs.engine(
  {
      layoutsDir: "views/layouts", 
      defaultLayout: "main",
      extname: "hbs"
  }
))
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views");

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

app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));