
const http = require("http");
const express = require("express"); // получаем модуль express
// создаем приложение express
const app = express();
//const jsonParser = express.json();
//const urlencodedParser = express.urlencoded({extended: true});
//app.use(express.urlencoded({ extended: true }));
try
{
app.get("/form", function (request, response) {
    let formErrorText = '</br><span style="color:black">Не менее 5 символов, включая заглавную</span></br>';
    let formErrorNumber = '</br><span>Только цифры до 100</span></br>'
    let goodRez = '<h2 style="color:green">' + request.query.newUser + ', вы молодец!!! Данные заполнили верно!</h2>';
    let nameUser = '';
    let age = '';
    let noEr = 10;
 
    if(request.url != "/form")
       {
         nameUser = request.query.newUser;
         age = request.query.userAge;

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
        }
    let myForm=`
        <form action="/form">
            <input type="text" name="newUser" value = '${nameUser}' > 
            ${formErrorText}
            <input type="text" name="userAge" value = '${age}'>
            ${formErrorNumber}
            <input type="submit" value='Отправить'>
        </form>`;

        if(noEr === 0)
            response.send(goodRez);
        else
            response.send(myForm);
    });
}
catch{console.log(error);}
app.listen(8181, ()=>console.log("Сервер запущен по адресу http://localhost:8181"));