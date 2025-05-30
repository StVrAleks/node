const http = require("http");
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const urlencodedParser = express.urlencoded({extended: true});
const mime = require('mime');
const multer  = require('multer');
const jsonParser = express.json();
const path = require('path');
const fs = require("fs");
const WebSocket = require('ws');
const port = 5632;
const server = new WebSocket.Server({ port:port });
const upload = multer ({dest: path.join(__dirname, 'uploads')});
//const readline = require('readline-sync');
//const fetch = require('node-fetch');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/*
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});*/
 
//app.use(multer({storage:storageConfig}).single("ChoiseFile"));

//webSocet-connect
let clients = [];
let timer = 0;
server.on('connection',connection =>{
    connection.send('hello from server to client! timer: ' + timer);
    connection.on('message', message =>{
        if(message === 'KEEP_ME_ALIVE'){
            clients.forEach(client =>{
                if(client.connection ===connection)
                    client.lastkeepalive = Date.now();
            });
        }
        else
            console.log('сервером получено сообщение от клиента: '+ message);
    });
    clients.push({connection:connection, lastkeepalive:Date.now()});
});
setInterval(()=>{
    timer++;
    clients.forEach(client => {
        if((Date.now() - client.lastkeepalive)>12000){
            client.connection.terminate();
            client.connection =null;
        }
        else
        client.connection.send('timer' + timer);
    });
    clients = clients.filter(client => client.connection);
}, 3000);

//HTTP
app.options("/upload", function (request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.send();
});


const serviceDownFiles = upload.fields([{name:'file', maxCount:1}]);
//загрузка файла на сервер
app.post("/upload", serviceDownFiles ,function (request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    let filedata = request.body;
  //  console.log('filedata',request.files);
    try{
        let fname = request.files.file[0]["filename"];
        let fOrname = request.files.file[0]["originalname"];
        let infoFile = {[fname] :{[0]:filedata["comment"], [1]:fOrname}};
        let infoFiles0 = fs.readFileSync(path.resolve(__dirname, "filesComment.json"));
        let infoFiles = JSON.parse(infoFiles0);
      // 
      let len = Object.keys(infoFiles).length;
     //  console.log('len', len);
        infoFiles[fname] ={[0]:filedata["comment"], [1]:fOrname, ["len"]:len+1};
       // infoFiles.push(infoFile);
           fs.writeFileSync(path.resolve(__dirname, "filesComment.json"), JSON.stringify(infoFiles));
          //    console.log("/voit write to file", infoFiles);
           }
           catch (err) {
            console.log(err);
           }
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
        let allFil = {};
        await fs.readdir(path.resolve(__dirname, "uploads"), (err, files) => {
            if(err)
            {
               // console.log('err', err);
                response.send(); 
            }    
            for(var i=0; i<files.length; i++)
                allFil[i] = files[i];
            //console.log('files', allFil);
           // let allFil = JSON.parse(allFil0);
            response.send(allFil); 
        });
    }
     catch(err){console.log(err)};
});    
app.post('/readInfo',jsonParser, (request, response)=>{
      if(!request.body) return response.sendStatus(400);
    //console.log(request.body.data1);
    let allFiles = request.body.data1;
    //let allFiles = JSON.parse(allFiles0);
   // console.log("allFiles", allFiles);
    let infoFiles1 = fs.readFileSync(path.resolve(__dirname, "filesComment.json"));
   // console.log(infoFiles1);
    let infoFiles = JSON.parse(infoFiles1);
 //   console.log("infoFiles1", infoFiles);
  //   console.log("infoFiles1", infoFiles.lenght);
    let fullInfoCom = new Array;
    let fullInfoName = new Array;
    let fullInfoNum = new Array;
    for(key in allFiles) //ключ в прилетевшем объекте (весть список файлов папки)
    {
        //console.log("len",infoFiles);   
           // console.log("sravnivaem",allFiles[key], infoFiles[key]);
            if(allFiles[key] in infoFiles) //что было считано с файла
            {
                fullInfoName.push(infoFiles[allFiles[key]][1]);
                fullInfoCom.push(infoFiles[allFiles[key]][0]);
                fullInfoNum.push(infoFiles[allFiles[key]]['len']);
            }
    }
    fullInfo={["0"]: fullInfoName, ["1"]: fullInfoCom, ["len"]: fullInfoNum};
   // console.log("fullInfo", fullInfo);
    response.send(fullInfo)
});
app.post('/download', jsonParser, async function (request, response){
try{
   //console.log(request.headers["accept"]);
    let itemName0 = request.body.item;
    let itemName;
    //console.log(request.body);
    let infoFiles0 = await fs.readFileSync(path.resolve(__dirname, "filesComment.json"));
    let infoFiles = JSON.parse(infoFiles0);
    for(key in infoFiles)
    {
        if(infoFiles[key]['len'].toString() === itemName0.toString())
           itemName = key;
    }

    if(itemName==='')
        response.sendStatus(400);
    let folderPath = path.resolve(__dirname, "uploads", itemName);
    
    //проверить - есть ли такой файл?
    fs.stat(folderPath, function(err, stat) {
       if (err == null) {
            console.log('File exists', folderPath);
            response.download(folderPath);
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
