
const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express


const urlencodedParser = express.urlencoded({extended: true});
//const mime = require('mime');
const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, '/uploads');
    },
    filename: function(req, file, cb){
    cb(null, file.originalname);    
    }
});
const upload = multer({ dest: storage });

const path = require('path');
//const { forEach } = require("lodash");
//const { error } = require("console");
//const fetch = require('node-fetch');
const jsonParser = express.json();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//res.logIgnore = true


app.get("/page", function (_, response) {
    console.log(__dirname);
        response.sendFile(__dirname + "/index.html");
    });

app.post('/upload', upload.single('file'), (req, res) =>{
    console.log(file);
    if(!file)
        res.send("Ошибка при загрузке файла");
    else
        res.json(req.file);
       //res.send("Файл загружен");
    
});

app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));
