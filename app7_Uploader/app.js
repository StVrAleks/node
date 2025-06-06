
const WebSocket = require('ws');
const http = require("http");
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const urlencodedParser = express.urlencoded({extended: true});
const multer  = require('multer');
const jsonParser = express.json();
const path = require('path');
const fs = require("fs");


const port = 8180; 
const server = new WebSocket.Server({ port:port });

const host = 'localhost:8180';
const upload = multer ({dest: path.join(__dirname, 'uploads')});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


//-----------------------------
//webSocet-connect
let cID=0;
let allClient ={[cID]:{"clients": []}};
//let clients = [];
let timer = 0;
let clientMes= 0;
server.on('connection', connection  => { // connection - это сокет-соединение сервера с клиентом
//var uploadedBytes=0;

    const clientId = Math.random().toString(36).substring(2, 15);
  //  connection.send('hello from server to client! timer=' +timer); // это сообщение будет отослано сервером каждому присоединившемуся клиенту
    connection.send('hello from server to client! timer=' +timer);
    connection.on('message', message => {
        if ( message==="KEEP_ME_ALIVE" ) {
            allClient[cID]["clients"].forEach( client => {

                if ( client.connection===connection )  
                    client.lastkeepalive=Date.now();
            } );
        }
        else if ( message.includes("request_connection_id") ) {
            allClient[clientId] =allClient[0];
        connection.send(JSON.stringify({ type: clientId }));}
        else{
            console.log('сервером получено сообщение от клиента: ' + message); // это сработает, когда клиент пришлёт какое-либо сообщение
        }
        });
//console.log(cID);
    allClient[cID]["clients"].push( { connection:connection, lastkeepalive:Date.now() } );
});


setInterval(()=>{
    timer = timer + 1;
 for(key in allClient)
 {  
     allClient[key]["clients"].forEach(client => {
      //  console.log('raznica  ',Date.now() - client.lastkeepalive);
        if((Date.now() - client.lastkeepalive)>150000){ //5минут300000
            client.connection.terminate();
            client.connection =null;
        }
        else
        client.connection.send('timer=' + timer);
    });
    for(key in allClient)
    allClient[key]["clients"] = allClient[key]["clients"].filter(client => client.connection);
 }
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
    let clId =request.body.clID;
    console.log("clId", clId);
    const totalBytes = parseInt(request.headers['content-length'], 10);

    if(request.files.file[0])
   {
    var flag = 10; //шаг отображения загрузки в процентах
    var indicator = 0;
    var uploadedBytes = 0;
    var readableStream = fs.createReadStream(request.files.file[0]['destination'] + '/'+ request.files.file[0]['filename'],{encoding: 'utf8'});
    readableStream.on('data', chunk => {
       
        uploadedBytes += chunk.length;
        const filePogress = (uploadedBytes / totalBytes) * 100;
        if(filePogress - flag > 0)
        {
            console.log(`Progress: ${filePogress.toFixed(2)}%`);
            flag += 10;
             clientMes = filePogress.toFixed(2);
             // отрабатывает неверно и отправляет первому
             allClient[clId]["clients"].forEach( client => {
               console.log('clId2', clId);
                if(clientMes != indicator)
                    {
                    client.connection.send(clientMes);
                    indicator = clientMes;
                    }
                 else 
                   client.connection.send('0'); 
            } );
        }
    });
    readableStream.on('end', () =>{
        // отрабатывает верно и отправляет кому надо
        allClient[clId]["clients"].forEach( client => {
            client.connection.send('0'); 
            });
    });

 
   

   }

    try{
       let fname = request.files.file[0]["filename"];
       let fOrname =decodeURI(filedata["fileOrigName"]);

/*****прочитали с файла названия всех имеющихся загрузок с комментами*/
        let infoFiles0 = fs.readFileSync(path.resolve(__dirname, "filesComment.json"));
        let infoFiles = JSON.parse(infoFiles0);
     // console.log('fOrname',decodeURI(fOrname));
        
/**** Записали в файл коммент + имя файла (внутреннее и оригинальное) */
        let len = Object.keys(infoFiles).length;
        infoFiles[fname] ={[0]:filedata["comment"], [1]:fOrname, ["len"]:len+1};
        fs.writeFileSync(path.resolve(__dirname, "filesComment.json"), JSON.stringify(infoFiles));
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
            response.send(allFil); 
        });
    }
     catch(err){console.log(err)};
});    
app.post('/readInfo',jsonParser, (request, response)=>{
      if(!request.body) return response.sendStatus(400);
    let allFiles = request.body.data1;
    let infoFiles1 = fs.readFileSync(path.resolve(__dirname, "filesComment.json"));
    let infoFiles = JSON.parse(infoFiles1);
    let fullInfoCom = new Array;
    let fullInfoName = new Array;
    let fullInfoNum = new Array;
    for(key in allFiles) //ключ в прилетевшем объекте (весть список файлов папки)
    {
            if(allFiles[key] in infoFiles) //что было считано с файла
            {
                fullInfoName.push(infoFiles[allFiles[key]][1]);
                fullInfoCom.push(infoFiles[allFiles[key]][0]);
                fullInfoNum.push(infoFiles[allFiles[key]]['len']);
            }
    }
    fullInfo={["0"]: fullInfoName, ["1"]: fullInfoCom, ["len"]: fullInfoNum};
    response.send(fullInfo)
});
app.post('/download', jsonParser, async function (request, response){
try{
    let itemName0 = request.body.item;
    let itemName;
    console.log(request.body.item);
    let infoFiles0 = await fs.readFileSync(path.resolve(__dirname, "filesComment.json"));
    let infoFiles = JSON.parse(infoFiles0);
    for(key in infoFiles)
    {
        if(infoFiles[key]['len'].toString() === itemName0.toString())
           itemName = key;
         console.log("itemName", itemName);
    }

    if(itemName === '')
        response.sendStatus(400);
   
    let folderPath = path.resolve(__dirname, "uploads", itemName);
    
    //проверить - есть ли такой файл?
    fs.stat(folderPath, function(err, stat) {
       if (err == null) {
          //  console.log('File exists', folderPath);
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

app.listen(8181, port, ()=>console.log(`Сервер запущен по адресу http://localhost:8181, ${host}`));
