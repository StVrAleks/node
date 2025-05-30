
const http = require("http");
const express = require("express"); 
const app = express();// создаем приложение express
const jsonParser = express.json();
const mysql=require("mysql");
const { includes, reject, result } = require("lodash");
const path = require('path');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}


app.use(express.static(path.join(__dirname, 'public')));
app.get("/page", function (_, response) {
    console.log(__dirname);
        response.sendFile(__dirname + "/index.html");
    });

app.post('/showAll', async (request, response) =>{
  var reqNames = new Array;
  const connectionConfig={
  host     : 'localhost',  // на каком компьютере расположена база данных
  user     : 'root',   // каким пользователем подключаемся (на учебном сервере - "root")
  password : '1234',   // каким паролем подключаемся (на учебном сервере - "1234")
  };

var connection = mysql.createConnection(connectionConfig);
connection.connect();
connection.query('show schemas', (error, results) => {
logger.info('/showAll__Открыли соединение к MySQL');
    if (error) throw error;

    results.forEach( row => {
     var stroka = row.Database;
     reqNames.push(stroka);
    });
 
  });



let promiseRea = new Promise((resolve, reject) => {
  closeConnection(connection)
  .then(() => {
    logger.info("/showAll__Соединение успешно закрыто!");
    response.send(reqNames);
    resolve(reqNames);
  })

  .catch((error) => {
    logger.error("/showAll__Ошибка при закрытии соединения:", error);
     reqNames[0] = 'Возникла ошибка' + error;
     response.send(reqNames);
    reject(reqNames);// Обработка ошибки при закрытии соединения
  });

});

});    
app.post('/run', jsonParser, async function(request, response){
  if(!request.body) 
    {
      logger.error("/run__Ошибка при получении запроса:", error);
      return response.sendStatus(400);}
  logger.info("/run__Обработка запроса");    
  let newReq = request.body.userReq;
  let nameTabl = request.body.selTabl;

  let strokaReq = newReq.toLowerCase();
  let strokaReq0 =strokaReq.slice(0,6);

  if(strokaReq0 === 'select')
    {
        await runReq(newReq, nameTabl)//reqNames,
        .then(result => { 
           response.send(result);
        });
      }
    else{
       await runReq1(newReq,nameTabl)
        .then(result => { 
           response.send(result);
        });
    }  
});

async function runReq(userReq, nameTabl){
   const connectionConfig={
  host     : 'localhost',  // на каком компьютере расположена база данных
  user     : 'root',   // каким пользователем подключаемся (на учебном сервере - "root")
  password : '1234',   // каким паролем подключаемся (на учебном сервере - "1234")
  database : nameTabl//'learning_db' // к какой базе данных подключаемся
  };
  let reqNames = {}, allKey = {}, flag = '-';
for (key in reqNames)
    reqNames[key] = new Array;

var connection = mysql.createConnection(connectionConfig);
connection.connect();
connection.query(userReq, (error, results) => {
logger.info('/run__Открыли соединение к MySQL');
    if (error)
      {
        logger.error("/run__Ошибка в запросе:", error);
        reqNames['error'] = new Array;
        return reqNames['error'].push(JSON.stringify(error));
      } 

      results.forEach( row => {
        for(key in row)
         {
          if(key in allKey)
            flag = 3;
          else
          {
            allKey[key] = key;
            reqNames[key] = new Array;
          }  
         }
      });
    
      results.forEach( row => { 
     for(key in row){
        key=key.toString();
        var stroka = row[key];
        reqNames[key].push(stroka);
        }   
      });

});
let promiseRea = new Promise((resolve, reject) => {
  closeConnection(connection)
  .then(() => {
    logger.info('/run__Соединение успешно закрыто');
    resolve(reqNames);
  })

  .catch((error) => {
    logger.error("/run__Ошибка при закрытии соединения:", error);
    reqNames['error'] = new Array;
    reqNames['error'].push(JSON.stringify(error));
    reject(reqNames);// Обработка ошибки при закрытии соединения
  });
});
  let get_rez = await promiseRea;
  return await get_rez;
}  

function closeConnection(connection) {
  return new Promise((resolve, reject) => {
    connection.end((err) => {
      if (err) {
        reject(err); // Reject Promise if an error occurs
      } else {
        resolve(); // Resolve Promise with no arguments upon successful closure
      }
    });
  });
}


async function runReq1(userReq,nameTabl){
   const connectionConfig={
  host     : 'localhost',  // на каком компьютере расположена база данных
  user     : 'root',   // каким пользователем подключаемся (на учебном сервере - "root")
  password : '1234',   // каким паролем подключаемся (на учебном сервере - "1234")
  database : nameTabl//'learning_db' // к какой базе данных подключаемся
  };

let rez = new Array;
var reqNames={'Количество обработанных строк':''};
var connection = mysql.createConnection(connectionConfig);
connection.connect();
connection.query(userReq, (error, results, fields) => {
logger.info('/run__Открыли соединение к MySQL');

    if (error) {
      logger.error("/run__Ошибка в запросе:", error);
      reqNames['error'] = new Array;
      return reqNames['error'].push(JSON.stringify(error));
    }

    rez[0]= results.affectedRows;
    reqNames['Количество обработанных строк'] = rez;

  });

let promiseRea = new Promise((resolve, reject) => {
  closeConnection(connection)
  .then(() => {
    logger.info('/run__Соединение успешно закрыто');
    resolve(reqNames);
  })

  .catch((error) => {
     logger.error("/run__Ошибка при закрытии соединения:", error);
     reqNames['Выполнение вопроса закончилось ошибкой'] = new Array;
     reqNames['error'].push(JSON.stringify(error));
    reject(reqNames);// Обработка ошибки при закрытии соединения
  });
});
  let get_rez = await promiseRea;
  return await get_rez;
} 


app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));    