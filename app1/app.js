
const http = require("http");
const fs = require("fs");
const express = require("express"); // получаем модуль express
const { Headers } = require("node-fetch");
// создаем приложение express
const app = express();

const urlencodedParser = express.urlencoded({extended: true});
const mime = require('mime');
const { send } = require("process");
const { forEach } = require("lodash");
const jsonParser = express.json();
app.use(express.urlencoded({ extended: true }));

app.get("/page", function (_, response) {
        response.sendFile(__dirname + "/index.html");
    });

app.post("/stat", urlencodedParser, function (request, response) {
      const data = fs.readFileSync("voice.json");
      if(!data) {  // если возникла ошибка
          return console.log('/stat pysto', data);
      }
      console.log("/stat read", JSON.parse(data));
      //response.send(data);
      let clientData = JSON.parse(data);
            response.send(clientData);
    });

app.post("/voit", jsonParser, function (request, response) {
        if(!request.body) return response.sendStatus(400);
       console.log("request.body", request.body);
        let dishes = request.body.dish;   
       // let variants = {};
        if (dishes === 0)
        {
            console.log('/voit  no vibor');  
            response.status(401).end();
        }    
        //чтение
        const data = fs.readFileSync("voice.json");
        if(!data) {  // если возникла ошибка
            return console.log('pysto', data);
        }

        let clientData = JSON.parse(data); 
            clientData[dishes] = clientData[dishes] + 1;
                       
        //запись в файл
     /*   const writeableStream = fs.createWriteStream("voice.json");
              writeableStream.write(JSON.stringify(textList));
              writeableStream.end("\n");
            */  
           try{
           fs.writeFileSync("voice.json", JSON.stringify(clientData));
              console.log("/voit write to file", clientData);
           }
           catch (err) {
            console.log(err);
           }
        response.send(clientData);
    });

app.get("/variants", function (request, response) {
      //  let itemVariants = [{"code":1, "text":"Борщ"},{"code":2, "text":"Пельмени"},{"code":3, "text":"Конфетки, бараночки"},{"code":4, "text":"Мандарики, апельсинки"},{"code":5, "text":"Криветки, устрицы"}];
        fs.readFile("variants.json", 'utf8', function(error,data){
            if(error) {  // если возникла ошибка
                return console.log(error);
            }
            console.log('view variants',JSON.stringify(data));
            let clientData = JSON.parse(data);
            response.send(clientData);
        })
});   
app.post('/download', function (request, response){

console.log(request.headers["content-type"]);
let nameHeader = request.headers["content-type"];
if(nameHeader === 'application/json')
{
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Content-disposition', 'attachment; filename="stat.json"');
   //содержимое файла
   let filestream = fs.readFileSync("voice.json");
   // filestream.pipe(response);
   var clientData = JSON.parse(filestream); 
   response.send(clientData);
}
else if(nameHeader === 'application/xml')
{
    let allStroka = `<?xml version="1.0" encoding="UTF-8" ?>
                     <stat>Статистика`;
    response.setHeader('Content-Type', 'application/xml');
    response.setHeader('Content-disposition', 'attachment; filename="stat.xml"');
    let filestream = fs.readFileSync("voice.json");
    let clientData = JSON.parse(filestream); 
    for(var i in clientData)
        {
        allStroka = allStroka + `
                    <${i}>${clientData[i]}</${i}>`;
        }
        allStroka = allStroka + `
                    </stat>`;
     
    response.send(allStroka);
}

   
});  
  
app.listen(7980, ()=>console.log("Сервер запущен по адресу http://localhost:7980"));