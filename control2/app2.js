const http = require("http");
const fs = require("fs");
const readline = require('readline-sync');

let objFiles = {};
let objArh = {};
/*fs.readdir(__dirname + "/compres", function(error,data) {
  if (error) throw error;
  
  console.log(data);
 */
let allFiles = getFiles();
/*fs.readdir(__dirname + "/compres", function(error,data) {
  if (error) throw error;
  console.log('ddd',data);  
   allFiles = data;

 //  return items; 
  });*/
console.log('aaa',allFiles);
for(var i=0; i< allFiles.length; i++)
{
  var nStr = allFiles[i];
   fs.stat(__dirname + "/compres/" + allFiles[i], function(error,stat){
    if(error) {  // если возникла ошибка
        return console.log(error);
    }
    if(nStr.includes('gz'))
     objArh[i] = {[allFiles[i]]:'', [stat.mtime]:''};
    else
    objFiles[i] = {[allFiles[i]]:'',  [stat.mtime]:''};
  console.log(stat.mtime);   // выводим считанные данные 
  });
}
   
  
 // console.log(nStr);
/*if(nStr.includes('gz'))
     objArh[i] = {[data[i]]:''};
else
    objFiles[i] = {[data[i]]:''};
}*/
console.log('objFiles',objFiles); 
//});


async function getFiles(){
let items ='';
 await fs.readdir(__dirname + "/compres", function(error,data) {
  if (error) throw error;
   items = data;
  console.log('asda',data);
  // return items; 
  });
  return await data;

}
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

const http = require("http");
const fs = require("fs");
//const readline = require('readline-sync');

let objFiles = {};
let objArh = {}; 

letStart();
function letStart(){
let allItems, res;
let a = getFiles();
console.log("Информация по каждому файлу FFF", a);
}


async function getFiles(){
 let items ='';
 console.log('Я зашел в папку');
 await fs.readdir(__dirname + "/compres", function(error,data) {
    if (error) throw error; 
    items = data;
    console.log('В папке найдены файлы:', items);
    let allFiles = getFilesData(items);
    return allFiles;
}) 


}

async function getFilesData(allItems){
console.log('Hадо обработать следующие файлы', allItems);
//for(var i=0; i< allItems.length; i++)
//{
var i=-1;
{  
  console.log(allItems.length);
 var i=i+1; 
 var nStr = allItems[i]; 
 new Promise((resolve, reject) =>{

  fs.stat(__dirname + "/compres/" + allItems[i], function(error,stat){
    if(error) {  return console.log(error);  } // если возникла ошибка 
      return resolve(stat.mtime);
  })})
  .then(resolve =>  {
    //console.log("resolve", resolve);
    if(nStr.includes('gz'))
      objArh[i] = {[allItems[i]]:'', [resolve]:''};
    else
      objFiles[i] = {[allItems[i]]:'',  [resolve]:''};
  console.log('выводим считанные данные', resolve);   // выводим считанные данные 
  console.log(objArh, objFiles);
return objFiles;
});
}while(i >= allItems.length);
//}

}

