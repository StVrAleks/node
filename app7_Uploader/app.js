const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const urlencodedParser = express.urlencoded({extended: true});
const mime = require('mime');
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
let folderPath = path.resolve(__dirname, "uploads", itemName);
//проверить - есть ли такой файл?
    fs.stat(folderPath, function(err, stat) {
       if (err == null) {
            console.log('File exists', folderPath);
            response.download(folderPath);
          /*  fs.readFileSync(folderPath, function(err, file) {
                if(err)
                    console.log('При получении файла возникла ошибка', err);
                else{
                  response.setHeader('Content-disposition', 'attachment; filename=itemName');  
                  console.log('file-74', file);  
                  response.download(folderPath);
                
            }); */
        } 
            else if (err.code === 'ENOENT') {
            // file does not exist
            fs.writeFile('log.txt', 'Some log\n');
                response.send();  
        } else {
            console.log('Some other error: ', err.code);
                response.send();  
        }        
    });
    }
     catch(err){console.log(err)};
});    

async function feadF(file_path) {
  const mime_type = mime.lookup(file_path); 
     let data =await  fs.readFileSync(file_path); 
     let sendData = await readData(data); 
  console.log(mime_type);
  if(mime_type.includes('image'))   //если возвращается картинка
    {
     console.log('if img');
     const arrayBuffer = await data.arrayBuffer();
     const base64data = Buffer.from(arrayBuffer).toString("base64");
     const dataUrl = `data:${mime_type};base64,${base64data}`
     //const dataUrl = `data:${res.headers.get("content-type")};base64,${base64data}`
     const pic = JSON.stringify(dataUrl, null, 2);
     return JSON.parse(pic);
     //   console.log('resObj.body', resObj.body);
    }
  else //если возвращается не картинка
    {
    return await sendData;
    } 
}

async function readData(data){
 try{
  const chunks = [];
    const buffers = []; // буфер для получаемых данных
    for await (const chunk of data) {
      buffers.push(chunk);        // добавляем в буфер все полученные данные
    }
    const chunksAll = Buffer.concat(buffers);
    let position = 0;
    for(let chunk of chunks) {
      chunksAll.set(chunk, position); 
      position += chunk.length;
    }
    let result = new TextDecoder("utf-8").decode(chunksAll);

    console.log("result");
    return result;
 }
 catch(er){
  console.log(' getReqerror', er);
 }  
    }


app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));


