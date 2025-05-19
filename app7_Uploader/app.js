
const http = require("http");
const fs = require("fs");
const express = require("express"); // получаем модуль express
//const multer  = require("multer");
const app = express();// создаем приложение express

const urlencodedParser = express.urlencoded({extended: true});
//const mime = require('mime');


const path = require('path');
//const { forEach } = require("lodash");
const { error } = require("console");
const fetch = require('node-fetch');
var logger = require('express-log-url');
const jsonParser = express.json();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//res.logIgnore = true
app.use(require('express-log-url'));
logger.log({'addr':$remote_addr, 'time':[$time_local], 'request':"$request", 'status':$status});
app.get("/page", function (_, response) {
    console.log(__dirname);
        response.sendFile(__dirname + "/index.html");
    });

app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));
