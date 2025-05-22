const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const urlencodedParser = express.urlencoded({extended: true});
//const mime = require('mime');
const multer  = require('multer');
const jsonParser = express.json();
const path = require('path');
const fs = require("fs");
//const readline = require('readline-sync');
//const fetch = require('node-fetch');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
 
app.use(multer({storage:storageConfig}).single("ChoiseFile"));
app.post("/upload", function (request, response, next) {
  
    let filedata = request.file;
    console.log('filedata',filedata);
    if(!filedata)
        response.send("Ошибка при загрузке файла");
    else
        response.send("Файл загружен");
});

app.get("/page", function (_, response) {
  //  console.log(__dirname);
        response.sendFile(__dirname + "/index.html");
    });

app.post('/viewFiles', async function (request, response){
    try{
      await fs.readdir(path.resolve(__dirname, "uploads"), (err, files) => {
            if(err)
            {
                console.log('err', err);
                response.send(); 
            }    
            let allFil = {};
            for(var i=0; i<files.length; i++)
                allFil[i] = files[i];
            console.log('files', allFil);
            response.send(allFil); 
        });
    }
     catch(err){console.log(err)};
});    

app.post('/download', jsonParser, async function (request, response){
try{
   console.log(request.headers["accept"]);
    let itemName = request.body.item;
    console.log(request.body);
      await fs.readdir(path.resolve(__dirname, "uploads"), (err, files) => {
            if(err)
            {
                console.log('err', err);
                response.send(); 
            }    
           console.log(files);
            for(var i=0; i<files.length; i++)
            { 
                 console.log(itemName, files[i]);
                if(itemName === files[i])
                {
                    console.log('tut1');
                    
                    response.setHeader('Content-disposition', 'attachment; filename=itemName');
                   // fs.readFileSync(path.resolve(__dirname, "uploads",itemName)).pipe(response);}
                    let data = fs.readFileSync(path.resolve(__dirname, "uploads",itemName));
                        console.log(data);
                        let sendF = JSON.parse(data);
                        console.log(sendF);
                       response.on('data', function(data) {
                        console.log(data);
                            let file = JSON.parse(data);
                            response.send(file);
                       })
                   //https://developer.mozilla.org/ru/docs/Web/API/XMLHttpRequest_API/Sending_and_Receiving_Binary_Data     
                    }
                   // var clientData = JSON.parse(filestream); 
                   // console.log('tytyt', path.resolve(__dirname, "uploads", itemName));
                    //console.log();
                    //response.send(clientData);
                    //response.pipe(filestream);
                    //filestream.pipe(response);
            }
         //   console.log("File not found");    
           // console.log('files', allFil);
        //    response.send(); 
        });
    }
     catch(err){console.log(err)};
});    
app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));

