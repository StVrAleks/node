const http = require("http");
const fs = require("fs");
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const cors = require('cors');

var CORSOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
 // AccessControlAllowOrigin: 'No',
};
//cors(CORSOptions)

const urlencodedParser = express.urlencoded({extended: true});
const mime = require('mime');

const jsonParser = express.json();
app.use(express.urlencoded({ extended: true }));

const path = require('path');
const { forEach } = require("lodash");
const { error } = require("console");
app.use(express.static(path.join(__dirname, 'public')));

app.get("/page", function (_, response) {
    console.log(__dirname);
        response.sendFile(__dirname + "/index.html");
    });

app.get("/leftpartREAD", urlencodedParser, function (request, response) {
      const data = fs.readFileSync("all_req.json");
      if(!data) {  // если возникла ошибка
        response.status(401).end();
      }
      console.log("/read", JSON.parse(data));
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
        let idDelC = request.body.num;
        var clientData = new Array;

        let newBody= request.body.reqBody;  
        let allRes  = {"method":newMethod,"url":newURL,"param":JSON.stringify(param),"body":newBody,"head":JSON.stringify(head), "num":idDelC, "str":'end'};

        //чтение
        const data = fs.readFileSync("all_req.json");
          
        
        if(data.length === 0) {  
           var clientData = allRes;
           clientData[0]["num"] = 0;  
        }
        else{
          var clientData = JSON.parse(data);
          for(var i=0; i < clientData.length; i++)
          {
            clientData[i]["num"] = i;
            //console.log(clientData[i]["num"]);
          }
          console.log(clientData.length, allRes["num"]);
           allRes["num"] = clientData.length;
          // console.log(allRes["num"]);
           clientData[clientData.length] = allRes;
        }
    
        //запись в файл 
           try{
           fs.writeFileSync("all_req.json", JSON.stringify(clientData));
              console.log("/write to file", clientData);
           }
           catch (err) {
            console.log(err);
           }
        response.send(clientData);
    });
 app.post("/change", jsonParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
  
      let curItem = request.body.num;
      
      let param = request.body.newParam;
      let head = request.body.reqHead;
      let allRes  = {
        "method":request.body.reqMethod,
        "url":request.body.textURL,
        "param":JSON.stringify(param),
        "body":request.body.allItemsForm['item5'],
        "head":JSON.stringify(head),
        "num":curItem,//;request.body.num, 
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
            console.log("Внесены изменения в ", i, 'num ', parseInt(curItem));  
            break;
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
        {
          clientData.splice(i, 1); 
          break; 
        }  
      }
      for(var i=0; i<clientData.length; i++)
        clientData[i]['num'] = i;
        console.log("Удален запрос");
      try{
        fs.writeFileSync("all_req.json", JSON.stringify(clientData));
        }
        catch (err) {
         console.log(err);
        }
     response.send(clientData);  
    });    

app.options('/run',(request, response)=>{
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.send("");
}
);
app.post("/run", jsonParser, cors(CORSOptions), async function (request, response) {
  let resItem = '';
      if(!request.body) return response.sendStatus(400);
    try{      
  //    response.setHeader('Access-Control-Allow-Origin', '*');
 
      let reqItems = request.body.allItemsForm;
      let reqMethod = JSON.stringify(reqItems["item1"]);
      let reqUrl = JSON.stringify(reqItems['item2']);
      let reqParam0 = reqItems['item3'];
      let reqParam = Object.assign({}, reqParam0);
      let reqBody = JSON.stringify(reqItems['item5']);
      let reqHead0 = JSON.stringify(reqItems['item6']);
      let reqHead = Object.assign({}, reqHead0);
      console.log(reqMethod,reqParam );
      console.log('items', reqItems);
      
      if(reqMethod === '"GET"')
      {
        console.log('v get');
        if(!reqParam)
        {
          for(key in reqParam)
            var strParam = strParam + key + '=' + reqParam[key] + '&';
          reqUrl= reqUrl + '?'+ strParam;
        }  
        console.log('reqParam', reqUrl, reqMethod, reqHead);
        resItem = await getReq(reqUrl, reqMethod, reqHead); 
        console.log('resItem', resItem);   
      }
      else if(reqMethod === '"POST"')
      {
        resItem = await postReq(reqUrl, reqMethod, reqHead, reqBody);
        console.log("resItem!!!", resItem);  
      }
      else if(reqMethod === '"OPTIONS"' || reqMethod === '"PATCH"')
        {
          resItem = await getReq(reqUrl, reqMethod, reqHead);
          console.log("resItem!!!", resItem);  
        }
      else if(reqMethod === '"UPDATE"')
        {
          resItem = await postReq(reqUrl, reqMethod, reqHead, reqBody);
          console.log("resItem!!!", resItem);  
        }  
      response.send(resItem);           
      }    
      catch(er){
        console.log('error /RUN', er);
      }
    });      

//*******POST */
async function postReq(reqUrl, reqMethod, reqHead, reqBody) {
    let resObj = {};
    let h= new Array, b= new Array;
    var i =0;          
  try{
      let res = await fetch(reqUrl.replaceAll(/"/g, ""),{
        method: reqMethod.replaceAll(/"/g, ""),
        redirect: 'manual',
        headers: reqHead,
        body: reqBody.replaceAll(/"/g, "")
      });
      for(header of res.headers)
        {
          h[i] = header[0];
          h[i+1] = header[1];
          if(h[i] === "content-type")
            var rT = h[i+1];
          i= i+2;
        } 
    if(rT.includes('image'))   //если возвращается картинка
     {
      let arrayBuffer = await res.arrayBuffer();
      let base64data = Buffer.from(arrayBuffer).toString("base64");
      let dataUrl = `data:${res.headers.get("content-type")};base64,${base64data}`
      let pic = JSON.stringify(dataUrl, null, 2);
      resObj.body = JSON.parse(pic);
     }
     else //если возвращается не картинка
      resObj.body = await readBody(res.body, res.headers); 
      resObj.st = await res.status;
      resObj.hd = h;
      resObj.ok = await res.ok;
      return await resObj; 
  }
  catch(er){
    console.log('postReq error', er);
  }  
  }


    //*******GET */
  async function getReq(freqUrl, freqMethod, freqHead) {
    let resObj = {};
    let h= new Array, b= new Array;
    var i =0;     
    let reqUrl = freqUrl.replaceAll(/"/g, "");
    let reqMethod = freqMethod.replaceAll(/"/g, "");
    let reqHead = freqHead;
  try{
     console.log('for fetch',reqUrl,reqMethod,reqHead);
      let res = await fetch(reqUrl,{
      method: reqMethod,
      redirect: 'manual',
      headers: reqHead
    });
    console.log('posle fetch');
    for(header of res.headers)
          {
            h[i] = header[0];
            h[i+1] = header[1];
            if(h[i] === "content-type")
              var rT = h[i+1];
            i= i+2;
          } 
      console.log('head', h);    
      if(rT.includes('image'))   //если возвращается картинка
       {
        console.log('if img');
        const arrayBuffer = await res.arrayBuffer();
        const base64data = Buffer.from(arrayBuffer).toString("base64");
        const dataUrl = `data:${res.headers.get("content-type")};base64,${base64data}`
        const pic = JSON.stringify(dataUrl, null, 2);
        resObj.body = JSON.parse(pic);
        console.log('resObj.body', resObj.body);
       }
       else //если возвращается не картинка
        resObj.body = await readBody(res.body, res.headers); 
  
        resObj.st = await res.status;
        resObj.hd = h;
        resObj.ok = await res.ok;
        console.log("resObj.hd",resObj.hd);
        return await resObj;
  }
   catch(er)
   {
    console.log(' getReqerror', er);
   } 
    
    } 
 
async function readBody(data, hed){
    const reader = data.getReader();//await res.body;
    const contentLength = +hed.get('Content-Length');
    let chunks = []; 
    let receivedLength = 0;
    while(true) {
  // done становится true в последнем фрагменте
  // value - Uint8Array из байтов каждого фрагмента
  const {done, value} = await reader.read();

    if (done) {
      break;
    }
    chunks.push(value);
    receivedLength += value.length;
    }
    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for(let chunk of chunks) {
      chunksAll.set(chunk, position); // (4.2)
      position += chunk.length;
    } 
    let result = new TextDecoder("utf-8").decode(chunksAll);
    return result;
    }
app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));
