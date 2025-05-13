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
