

const http = require("http");
const express = require("express"); // получаем модуль express
// создаем приложение express
const app = express();
//const jsonParser = express.json();
//const urlencodedParser = express.urlencoded({extended: true});
//app.use(express.urlencoded({ extended: true }));
const urlencodedParser = express.urlencoded({extended: true});
//const jsonParser = express.json();
//app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  let myForm=`
        <form action="/form" method='post'>
           <span>Введите имя</span> 
           </br>
           <input type="text" name="newUser" value = '' > 
           <span>Не менее 5 символов, включая заглавную</span>
           </br>
           </br>
            <span>Введите возраст:</span> 
            </br>
            <input type="text" name="userAge" value = ''>
            <span>Только цифры до 100</span>
            </br>
            <input type="submit" value='Отправить'>
        </form>`;  
	res.send(myForm);
});

try
{
app.post("/form", urlencodedParser, function (request, response) {
    let formErrorText = '</br><span style="color:black">Не менее 5 символов, включая заглавную</span></br>';
    let formErrorNumber = '</br><span>Только цифры до 100</span></br>'
  //  let goodRez = '<h2 style="color:green">' + request.query.newUser + ', вы молодец!!! Данные заполнили верно!</h2>';
    let nameUser = '';
    let age = '';
    let noEr = 10;
 console.log(request.url);
   // if(request.url != "/form")
     // {
         nameUser = request.body.newUser;
         age = request.body.userAge;
console.log(nameUser, age);
         //флаг наличия ошибок
         noEr = 0;
        //исправляем ошибочно введенные пробелы
        if(age.includes(' ') == true)
            age = age.replace(' ', '');   
        if(nameUser.includes(' ') == true)
            nameUser = nameUser.replace(' ', '');   

         //проверяем на корректный ввод
         if(age.length === 0 || !isNaN(Number(age)) == false || age > 100 || age < 1)
         {
            formErrorNumber = '</br><span style="color:red">Данные введены некорректно!</span></br>';
            noEr = 1;
         }   
        
         let userLine = [...nameUser];
         let countUp = 0;
         userLine.forEach((item) => {
            if(item.toUpperCase() === item)
                countUp = countUp + 1;});
            
        if(nameUser.length < 5 || countUp === 0)
        {
            formErrorText = '</br><span style="color:red">Данные введены некорректно!</span></br>';
            noEr = 1;
        }
        //}<form action="form?newUser=${nameUser}${request.url}">
    let myForm=`
        <form action="form" method='POST'>
            <span>Введите имя</span> 
            <input type="text" name="newUser" value = '${nameUser}' > 
            ${formErrorText}
            <span>Введите возраст:</span> 
            <input type="text" name="userAge" value = '${age}'>
            ${formErrorNumber}
            <input type="submit" value='Отправить'>
        </form>`;
console.log('1',request.query.name, '2', request.body.name,'3', nameUser);
        if(noEr === 0)
            response.redirect(301, '/success?name='+nameUser)
           // response.send(goodRez);
        else
        {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html');
            response.send(myForm);
        }    
    });
}
catch(error){
    console.log(error);
}

app.get('/success', (request, response) => {
    let goodRez = '<h2 style="color:green">' + request.query.name + ', вы молодец!!! Данные заполнили верно!</h2>';
    response.send(goodRez);
});

app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));
