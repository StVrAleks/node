const express = require("express"); // получаем модуль express
const app = express();// создаем приложение express

const urlencodedParser = express.urlencoded({extended: true});
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

//app.use(multer({dest:"uploads"}).single("file"));
multer({dest:"uploads"}).single("file");
const path = require('path');
const jsonParser = express.json();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/page", function (_, response) {
    console.log(__dirname);
        response.sendFile(__dirname + "/index.html");
    });

app.post('/upload', upload.single('file'), (req, res) =>{
    console.log(req.file);
    if(!file)
        res.send("Ошибка при загрузке файла");
    else
        res.json(req.file);
       //res.send("Файл загружен"); 
});
/*app.post("/upload",  (req, res, next) => {
   
    let filedata = req.file;
    console.log(json(filedata));
    if(!filedata)
        res.send("Ошибка при загрузке файла");
    else
        res.send("Файл загружен");
    next();
});*/

app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));
