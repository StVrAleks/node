const http = require("http");
const fs = require("fs");
//const readline = require('readline-sync');

/*let objFiles = {};
let objArh = {};*/ 
let filesInfo = {'file':{}, 'stat':{}, 'name':{}, 'format':{}};
let allItems;
let flag = 0;
letStart();

async function letStart(){
await getFiles();
}

function getFiles(){
 let items ='';
 let path = 'C:/Users/Sotnikova_VA.MOGISPIN/Desktop/node/node/node/control2/compres/'; //work
 console.log('Я зашел в папку');
    fs.readdir(__dirname + "/compres", function(error,data) {
      if (error) throw error; 
      console.log('В папке найдены файлы:', data);
      for(var i=0; i<data.length; i++)
        {
          var file = __dirname + "/compres/" + data[i];
          filesInfo['file'][i] = data[i];
          filesInfo['name'][i] = data[i].substring(0, data[i].indexOf("."));
          filesInfo['format'][i] = data[i].slice(data[i].lastIndexOf(".") + 1);
          console.log("Получили сведения о" + file);
          fs.stat(file, generate_callback(file, i, data.length-1));
        }
    })
}

function generate_callback(file, i, Objlen){
  return function(err, stats){
    console.log(file);
    filesInfo['stat'][i] = stats['mtime'];
    console.log(filesInfo);    
    if(Objlen === i) 
       workWithFiles();
  }
}

function workWithFiles(){
 console.log('super!', filesInfo['file'].length, filesInfo);
  let currentName;
 for(var i in filesInfo["file"])
 {
  console.log('super!', filesInfo["name"][i]);
    if(filesInfo['format'][i] != 'gz')
    {
      console.log('Есть ли архив у файла '+ filesInfo["name"][i] + "?");
      var step1 = nameInGz(filesInfo["name"][i]);
      if(step1 != false)
        var step2 = dateGz(filesInfo["stat"][i], filesInfo["stat"][step1]);
      if(step2 === true)
        console.log('Удаляем устаревший архив');
      if(step2 === true || step1 === false)
        console.log('делаем новый архив');
    }  
 } 
}

function nameInGz(currentName){
  for(var i=0; i<filesInfo.length; i++)
  {
    if(filesInfo['format'][i] === 'gz' && currentName === filesInfo['name'][i])
      {
      console.log('Архив существует');
      return i;
      }
  } 
 console.log('Архив не найден'); 
 return false;
}

function dateGz(currentStat, step1Stat){
 console.log('Сравниваю даты модификации файлов:', currentStat, " ",step1Stat);
  if(currentStat > step1Stat)
   {
    console.log('Архивная версия устарела:');
    return true;
   }
   else
   {
    console.log('Архивная версия ok');
    return false;
   }
}

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

