const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express
const urlencodedParser = express.urlencoded({extended: true});
//const mime = require('mime');
const multer  = require('multer');
const jsonParser = express.json();
const path = require('path');
const fs = require("fs");
const readline = require('readline-sync');
const fetch = require('node-fetch');
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
         let allName = await getFilesName();
       
     console.log('2',allName);
      let a = '20';
      response.send(a);   
    }
    catch(err)
    {console.log(err)};
});    

async function getFilesName() {
 response = await fs.readdir(__dirname + "/uploads", (data, error) => {
         if(error)
            console.log(error);
        
    });
    let data1 = await data.json();
    let alldata = new Array;
        for (const file of data1) 
                alldata.push(file);   
                 //   console.log('data',file);
    console.log('data',alldata);
    return alldata;
            
      //  let newData = data;
       /*  for (let file of files)
            newData.push(file);*/
      //  console.log('В папке найдены файлы:', data);
        // response.send(data); 
       // response= data;
       
      
     /*   let Alldata = "";
        response.on("data", data => {
            Alldata += data;
        });
        response.on("end", () => {
            console.log('data',Alldata);
            return Alldata;
        });  */
       // return newData;
    
}
async function getFilesName() {
    
    try {
        let data = await fs.readdir(__dirname + "/uploads");
        console.log(data);
        return data;
    } catch (err) {
        console.log("гетФиле",err);
    }
    return;
    
}
app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));
