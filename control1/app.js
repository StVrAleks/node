
const http = require("http");
const fs = require("fs");
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const mimeTypes = {
  '.html' : 'text/html',
  '.png' : 'image/png',
  '.css' : 'text/css',
  '.js' : 'text/javascript'
}



const urlencodedParser = express.urlencoded({extended: true});
const mime = require('mime');

const jsonParser = express.json();
app.use(express.urlencoded({ extended: true }));

function staticFile (res, filePath, ext){
  res.setHeader('Content-type', mimeTypes[ext]);
  fs.readFile('./public'+filePath, (error, data) =>{
    if(error){
      res.statusCode = 404;
      res.end();
    }
  });
}

http.createServer(function(req, res){
  const url = req.url;
  console.log(url);
  switch (url) {
    case '/page':
      staticFile(res, '/page', '.html');
      break;
    default:
      const extname = String(path.extname(url)).toLocaleLowerCase();
      if (extname in mimeTypes)
        staticFile(res, url, extname)
      else{
        res.statusCode = 404;
        res.end();
      }
  }
});


app.get("/page", function (_, response) {
    console.log(__dirname);
        response.sendFile(__dirname + "/index.html");
    });

app.get("/leftpartREAD", urlencodedParser, function (request, response) {
      const data = fs.readFileSync("all_req.json");
      if(!data) {  // если возникла ошибка
        response.status(401).end();
      }
      console.log("/stat read", JSON.parse(data));
      //response.send(data);
      let clientData = JSON.parse(data);
            response.send(clientData);
    });

app.post("/leftpartWRITE", jsonParser, function (request, response) {
        if(!request.body) return response.sendStatus(400);
       //console.log("request.body", request.body);
        let newMethod = request.body.reqMethod;   
        let newURL = request.body.textURL;
        let param = request.body.newParam;
        let head = request.body.reqHead;
        var clientData = new Array;

        let newBody= request.body.reqBody;  
        let allRes  = {"method":newMethod,"url":newURL,"param":JSON.stringify(param),"body":newBody,"head":JSON.stringify(head), "num":'', "str":'end'};

        //чтение
        const data = fs.readFileSync("all_req.json");
          
        
        if(data.length === 0) {  // если возникла ошибка
           var clientData = allRes;
           clientData[0]["num"] = 0;  
        }
        else{
          var clientData = JSON.parse(data);
          for(var i=0; i < clientData.length; i++)
          {
            clientData[i]["num"] = i;
            console.log(clientData[i]["num"]);
          }
          console.log(clientData.length, allRes["num"]);
           allRes["num"] = clientData.length;
           console.log(allRes["num"]);
           clientData[clientData.length] = allRes;
        }
    
        //запись в файл 
           try{
           fs.writeFileSync("all_req.json", JSON.stringify(clientData));
              console.log("/voit write to file", clientData);
           }
           catch (err) {
            console.log(err);
           }
        response.send(clientData);
    });
 app.post("/change", jsonParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
   //    console.log("request.body.allItemsForm", request.body.allItemsForm);
      let curItem = request.body.num;
      
//let newMethod = request.body.reqMethod;   
//let newURL = request.body.textURL;
      let param = request.body.newParam;
      let head = request.body.reqHead;
      let allRes  = {
        "method":request.body.reqMethod,
        "url":request.body.textURL,
        "param":JSON.stringify(param),
        "body":request.body.allItemsForm['item5'],
        "head":JSON.stringify(head),
        "num":request.body.num, 
        "str":'end'};   
      var clientData = new Array;
           
    //чтение
      const data = fs.readFileSync("all_req.json");
      clientData = JSON.parse(data);
        for(var i=0; i<clientData.length; i++)
        {
          if(clientData[i]['num'] === parseInt(curItem))
          {
            clientData[i] = allRes;
            console.log("Внесены изменения");  
          //  break;
          }   
        }
        for(var i=0; i<clientData.length; i++)
            clientData[i]['num'] = i;
    
       // запись в файл 
           try{
           fs.writeFileSync("all_req.json", JSON.stringify(clientData));
             // console.log("/voit write to file", clientData);
           }
           catch (err) {
            console.log(err);
           }
        response.send(clientData);
    });  
    app.post("/delete", jsonParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
      let curItem = request.body.num;
      var clientData = new Array;
      const data = fs.readFileSync("all_req.json");
      clientData = JSON.parse(data);
      for(var i=0; i<clientData.length; i++)
      {
        if(clientData[i]['num'] === parseInt(curItem))
          clientData.splice(i, 1);  
      }
      for(var i=0; i<clientData.length; i++)
        clientData[i]['num'] = i;
console.log("Удален запрос");
      try{
        fs.writeFileSync("all_req.json", JSON.stringify(clientData));
          // console.log("/voit write to file", clientData);
        }
        catch (err) {
         console.log(err);
        }
     response.send(clientData);  
    });    


    app.post("/run", jsonParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
      
      let reqItems = request.body.allItemsForm;
   //   console.log("reqItems",reqItems, reqItems);
      let reqMethod = JSON.stringify(reqItems["item1"]);
      let reqUrl = JSON.stringify(reqItems['item2']);
      let reqParam0 = reqItems['item3'];
    //  console.log("reqParam0",JSON.stringify(reqParam0));
      let reqParam = Object.assign({}, reqParam0);
      let reqBody = JSON.stringify(reqItems['item5']);
      let reqHead0 = JSON.stringify(reqItems['item6']);
      let reqHead = Object.assign({}, reqHead0);
      console.log(reqMethod);
      if(reqMethod === '"GET"')
      {
        console.log('v get');
        if(!reqParam)
        {
          for(key in reqParam)
            var strParam = strParam + key + '=' + reqParam[key] + '&';
          reqUrl= reqUrl + '?'+ strParam;
        }  
        let resItem = getReq(reqUrl, reqMethod, reqHead);
      }
      else if(reqMethod === '"POST"')
        postReq(reqUrl, reqMethod, reqHead, reqBody);
      

      resItem = JSON.parse(resItem);
      response.send(resItem);
    });   
    async function postReq(reqUrl, reqMethod, reqHead, reqBody) {
      let res = await fetch(reqUrl.replaceAll('"', ""),{
        method: reqMethod.replaceAll('"', ""),
        headers: reqHead,
        body: reqBody.replaceAll('"', "")
      });
        let data = await res.text();
        let st = await res.status;
        console.log("st",st, "data",data);
    }
    async function getReq(reqUrl, reqMethod, reqHead) {
      let resObj = {
        "st":'',
        "hd":''
      };
      let res = await fetch(reqUrl.replaceAll('"', ""),{
        method: reqMethod.replaceAll('"', ""),
        headers: reqHead
      });
        //let data = await res.text();
        resObj.st = await res.status;
        resObj.hd = await res.headers;
        console.log("resObj",resObj);
        return resObj;
    }   
 function fetchImage(reqUrl) {
      const apiKey = 'YOUR_API_KEY';
      fetch(reqUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          "x-rapidapi-host": "any-anime.p.rapidapi.com"
        }
      })
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        const imageElement = document.createElement("img");
        imageElement.src = imageUrl;
        const container = document.getElementById("image-container");
        container.appendChild(imageElement);
      });
    }
app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));
