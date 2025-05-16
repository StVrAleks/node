const fs = require("fs");
const zlib = require("zlib");
const readline = require('readline-sync');
//const glob = require("glob-fs");
const path = require("path");

let filesInfo = {'file':{}, 'stat':{}, 'name':{}, 'format':{}};
let newPath = '';
letStart();

async function letStart(){
//Укажите путь до папки для автокомпрессора, включая имя папки:
const answer = readline.question('Specify the newPath to the folder for the autocompressor, including the folder name: ',{ encoding: 'utf-8' });//, (answer) => {

newPath = answer;
if(!fs.existsSync(newPath))
  return console.log('Такой папки не существует! Укажите другой путь.');

console.log("newPath1", answer);  
  let lastItem = answer.substr(answer.length - 1);
  if(lastItem === '/' || lastItem === '/\/' || lastItem === '|')
    newPath = answer.substr(0, answer.length - 1);
 // readline.close();
//});
console.log("newPath", newPath);



/*
var getDirectories = function (src, callback) {
  var files = glob.readdirSync(src + '/** /*', callback);
  return files;
};
getDirectories(newPath, function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('newPath',res);
  }
});
*/


await getFiles();
}

function getFiles(){
 console.log('Я зашел в папку', newPath);
  //  fs.readdir(__dirname + "/compres", function(error,data) {
    fs.readdir(newPath, function(error,data) {
      if (error) throw error; 
      let newData = getFilDirFil(newPath, data);
      console.log('В папке найдены файлы:', data);
      for(var i=0; i<newData.length; i++)
        {
         // var file = __dirname + "/compres/" + data[i];
          var file = newPath + "/" + newData[i];
          filesInfo['file'][i] = newData[i]; //путь
          filesInfo['name'][i] = newData[i].substring(0, newData[i].indexOf("."));
          filesInfo['format'][i] = newData[i].slice(newData[i].lastIndexOf(".") + 1);
          console.log("Получили сведения о" + file);
          fs.stat(file, generate_callback(file, i, newData.length-1));
        }
    })
}
function getFilDirFil(newPath, data){
  var j = -1;
  var allData = new Array;
  for(var i=0; i < data.length; i++)
    {
      fs.stat(newPath + '/' + data[i], (err, stats) => {
      if (err) throw err; 
      if(stats.isFile())
        {
         j = j + 1;
         allData[j] = data[i];
         console.log(fs.existsSync(newPath + '/' + data[i]));
         console.log(stats);
        }    
      else  
      {
        var path2 = newPath + '/' + data[i];
        fs.readdir(path2, function(error, data1){
        if (error) throw error;   
        var dataIn = getFilDirFil(path2, data1);
        for(var k=0; k < dataIn[i].length; k++)
          {
          j = j + 1;  
          allData[j] = data[k];
          }  
        })
        
      }
    });
    }
    console.log("allData", allData);
    return allData;
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
 for(var i in filesInfo["file"])
 {
    if(filesInfo['format'][i] != 'gz')
    {
     console.log('Работаем с файлом', filesInfo["name"][i]);
      console.log('Есть ли архив у файла '+ filesInfo["name"][i] + "?");
      var step1 = nameInGz(filesInfo["name"][i]);
      if(step1 != false)
        var step2 = dateGz(filesInfo["stat"][i], filesInfo["stat"][step1]);
      if(step2 === true)
        var step3 = delFiles(filesInfo["file"][step1]); //Зачем удалять, если он заменится?
      if(step2 === true || step1 === false)
        addInGz(filesInfo["file"][i]);
    }  
 } 
//проверка на наличие архивов без исходного файла
let flagok = 0;
for(var i in filesInfo["file"])
 {
    if(filesInfo['format'][i] === 'gz')
    {
      for(var j in filesInfo["file"])
      {
        if(filesInfo['format'][j] != 'gz' && filesInfo['name'][j] === filesInfo['name'][i])
            {
              filesInfo['name'][j] = 'x'; //нашли пары файл - его архив
              filesInfo['name'][i] = 'x'; //имена проверенных файлов заменили на "х"
              flagok = 1;
              break;
            }
      } 
      
    }  
 } 

for(var i in filesInfo["file"])
  {
    if(filesInfo['name'][i] != 'x' && flagok === 1)
    {
      console.log("Найден архив без исходного файла", filesInfo['file'][i]);
      delFiles(filesInfo["file"][i]);
    }  
  }     

}

function nameInGz(currentName){
  for(var i in filesInfo["file"])
 {
    if(filesInfo['format'][i] === 'gz' && currentName === filesInfo['name'][i])
      {
      console.log('Архив существует');
      return i;
      }
  } 
 console.log("Для файла " + currentName + " архив не найден"); 
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

function delFiles(nameFile){
  try{
   // var file = "/compres/" + nameFile;
    fs.unlink(newPath + '/' + nameFile, (error) => {
   // fs.unlink(__dirname + file, (error) => {
      if(error) console.log("Ошибка на этапе удаления архива", error);
    }); 
    console.log('Устаревший архив ' + nameFile + ' удален.'); 
  }
  catch(err){
    console.log("Возникла ошибка " + err + " на этапе удаления файла " + nameFile);
  }
}

function addInGz(nameFile){
try{
  console.log('Новый архив создан для файла ', nameFile);
 // var file = "/compres/" + nameFile;
  //const readableStream = fs.createReadStream(__dirname + file); 
 // const writeableStream = fs.createWriteStream(__dirname + file +".gz");
  const readableStream = fs.createReadStream(newPath + '/' + nameFile); 
  const writeableStream = fs.createWriteStream(newPath + '/' + nameFile +".gz");
  const gzip = zlib.createGzip();
  readableStream.pipe(gzip).pipe(writeableStream);
}
catch(err){
  console.log("Возникла ошибка " + err + " на этапе создания архива " + nameFile);
}
}

