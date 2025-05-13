
const http = require("http");
const fs = require("fs");
const readline = require('readline-sync');

let objFiles = {};
let objArh = {};
let i =0;
fs.readdir(__dirname + "/compres", function(error,data) {
  if (error) throw error;
  
  console.log(data);
 
for(var i=0; i< data.length; i++)
{
  var nStr = data[i];
   fs.stat(__dirname + "/compres" + data[i]+'/tmp/', function(error,stat){
    if(error) {  // если возникла ошибка
        return console.log(error);
    }
    console.log(stat);   // выводим считанные данные
});
  console.log(nStr);
if(nStr.includes('gz'))
     objArh[i] = {[data[i]]:''};
else
    objFiles[i] = {[data[i]]:''};
}
console.log('objFiles',objFiles); 
});

/*fs.readFile(__dirname + "/compres", function(error,data){
    if(error) {  // если возникла ошибка
        return console.log(error);
    }
    console.log(data.toString());   // выводим считанные данные
});*/

/*
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.log('3');
rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  console.log(`Thank you for your valuable feedback: ${answer}`);

  rl.close();
});*/