const WebSocket = require('ws');
//const wsServer = new WebSocket.Server({port: 8180});
//const WebSocketServer = require('ws').server;
const http = require("http");
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const urlencodedParser = express.urlencoded({extended: true});
//const mime = require('mime');
const multer  = require('multer');
const jsonParser = express.json();
const path = require('path');
const fs = require("fs");
var websocket = require('websocket-stream');
//var ws = websocket('ws://echo.websocket.org');
//const expressWebSocket = require('express-ws');
//const websocketStream = require('websocket-stream/stream');
/*
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});*/
//const port = 8180; 
//const server = new WebSocket.Server({ port:port });

/*
wsServer = new WebSocketServer({
    httpServer: server
    //autoAcceptConnections: false
});*/
/*
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});*/
/*
expressWebSocket(app, null, {
    // ws options here
    perMessageDeflate: false,
});*/

const port = 8180; 
const server = new WebSocket.Server({ port:port });

const host = 'localhost:8180';
const upload = multer ({dest: path.join(__dirname, 'uploads')});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/*
function onSocketPreError(error){
    console.log(error);
}

server.on('upgrade', (req, socket, head) => {
    socket.on('error', onSocketPreError);
    if(!!req.headers['BadAuth']){
        socket.write('HTTP/1.1 401 Ubauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    server.handleUpgrade(req, socket, head, (ws) =>{
        socket.removeListener('error', onSocketPreError);
        server.emit('connection', ws, req);
    });
});

server.on('connection', (ws, req) =>{
    ws.on('connection', (ws, req) =>{
        ws.on('error', onSocketPostError);
        ws.on('message', (msg, isBinary) => {
            server.clients.forEach((client) => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(msg, {binary: isBinary});
                }
            });
        });
        ws.on('close', () =>{
            console.log('Connection is close');
        });
    });
});
*/
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
//-----------------------------
//webSocet-connect

let clients = [];
let timer = 0;
let clientMes='';
server.on('connection', (wsConnection, req) => { 
  wsConnection.on('connection', (wsConnection, req) =>{  
       // wsConnection.on('message', (message, isBinary) => {
            console.log(`server received: ${message}`);
            if(message === 'KEEP_ME_ALIVE'){
                    clients.forEach(client =>{
                        if(client.connection ===connection)
                            client.lastkeepalive = Date.now();
                    })
                clients.push({wsConnection:wsConnection, lastkeepalive:Date.now()});    
                }
            else if(message === 'close'){      
                client.lastkeepalive =null;
            } 
          //  else{
                console.log('doshel');
                const duplex = createWebSocketStream(wsConnection, { encoding: 'utf8' });
                duplex.on('error', console.error);
                duplex.on('data', () =>{wsConnection.send('dfhdfh');})
               // duplex.pipe(process.stdout);
                process.stdin.pipe(duplex);
                //console.log(process);
                console.log("duplex", duplex);
                client.send(msg, {binary: isBinary});
                 wsConnection.send('process');
          //  }
   
/*    {
try {
  // сообщение пришло текстом, нужно конвертировать в JSON-формат
        const jsonMessage = JSON.parse(message);
        switch (jsonMessage) {
            case 'ECHO':
            server.send(jsonMessage.data);
            break;
            case 'PING':
            setTimeout(function() {
                server.send('PONG');
            }, 2000);
            break;
            default:
            console.log('Неизвестная команда');
            break;
        }
        } catch (error) {
        console.log('Ошибка', error);
        }}*/
    });   
     wsConnection.send('got your message!');
});//});
setInterval(()=>{
    timer = timer + 1;
    clients.forEach(client => {
      //  console.log('raznica  ',Date.now() - client.lastkeepalive);
        if((Date.now() - client.lastkeepalive)>150000){ //5минут300000
            client.wsConnection.terminate();
            client.wsConnection =null;
        }
        else
        client.wsConnection.send('timer=' + timer);
    });
    clients = clients.filter(client => client.wsConnection);
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
    const totalBytes = parseInt(request.headers['content-length'], 10);
    console.log(`Progress: ${totalBytes}`);
   if(request.files.file[0])
   {
    var flag = 10; //шаг отображения загрузки в процентах
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
        }
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
