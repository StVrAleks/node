const http = require("http");
const fs = require("fs");
//const readline = require('readline-sync');

/*let objFiles = {};
let objArh = {};*/ 
let filesInfo = {'objFiles':'', 'objArh': ''};
let allItems;
letStart();

async function letStart(){
let allF= await getFiles();
}



async function getFiles(){
 let items ='';
 console.log('Я зашел в папку');
 new Promise((resolve, reject) =>{
    fs.readdir(__dirname + "/compres", function(error,data) {
    if (error) throw error; 
   // items = data;
    console.log('В папке найдены файлы:', data);
    return resolve(data);  
    })})
    .then(resolve =>{
      allItems = resolve;
      console.log('tyt', allItems);
      let objInfo = getFilesData(allItems);

    });
}

async function getFilesData(allItems){
console.log('Hадо обработать следующие файлы', allItems);
var dateFile = new Array;
 for(i=0; i<allItems.length;i++)
  { 
  console.log(i);
  var nStr = allItems[i]; 
 new Promise((resolve, reject) =>{
      fs.stat(__dirname + "/compres/" + allItems[i], function(error,stat){
        if(error) {  return console.log(error);  } // если возникла ошибка 
        dateFile[i]  = stat.mtime;
        return resolve(stat.mtime);
      })})
      .then(resolve =>  {
        console.log(dateFile);
        if(nStr.includes('.gz'))
          filesInfo.objArh[i] = {[i]:[allItems[i]], [i]:[resolve]};
        else
          filesInfo.objFiles[i] = {[i]:[allItems[i]], [i]:[resolve]};
        console.log('выводим считанные данные',i, resolve);   // выводим считанные данные 
        console.log('info',filesInfo);
        });
//var namePr = namePr +"newName" + i+ ',';
}

/*namesPr ='['+ namesPr.substring(0, namesPr.length-1) + "]";
console.log("namePr", namesPr);
Promise.all(namesPr).then((values) => {
  console.log(values);
}); */

}

/*const http = require("http");
const fs = require("fs");
const readline = require('readline-sync');

let objFiles = {};
let objArh = {};
/*fs.readdir(__dirname + "/compres", function(error,data) {
  if (error) throw error;
  
  console.log(data);
 */
/*let allFiles = getFiles();
/*fs.readdir(__dirname + "/compres", function(error,data) {
  if (error) throw error;
  console.log('ddd',data);  
   allFiles = data;

 //  return items; 
  });*/
/*console.log('aaa',allFiles);
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
/*console.log('objFiles',objFiles); 
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
