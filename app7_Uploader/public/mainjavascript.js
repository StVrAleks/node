    //*** при загрузке страницы устанавливаем обработчики на все кнопки конфиг. листа
    document.addEventListener("DOMContentLoaded", () => {
        let divLeft = document.getElementById('leftPart');
        divLeft.onclick = function(event) {
             let target = event.target; // где был клик?
       //      console.log(target.tagName);
             if (target.tagName != 'INPUT') return; // не на INPUT? тогда не интересует
             configToForm(target); // загрузить форму по нажатию на кнопку
     };
     });
     
       function changeMet(){
         document.getElementById('resReq').style.display = 'none';
         document.getElementById('output').style.display = 'none';
         document.getElementById('resPic').style.display = 'none';
         let method = document.getElementById('reqMethod').value;
       //  console.log("method", method);
         if(method === 'metGET')
        {
         document.getElementById('req_Body').style.display = 'none';
         document.getElementById('toAddNewParam').style.display = 'block';
         document.getElementById('tableParametr').style.display = 'block';
        }
      else if(method === 'metPost')    
      {
         document.getElementById('req_Body').style.display = 'block';
         document.getElementById('toAddNewParam').style.display = 'none';
         document.getElementById('tableParametr').style.display = 'none';
      }
      else if(method === 'metUpdate')   
      {
         document.getElementById('req_Body').style.display = 'block';
         document.getElementById('toAddNewParam').style.display = 'block';
         document.getElementById('tableParametr').style.display = 'block';
      }
      else if(method === 'metPatch') 
      {
         document.getElementById('req_Body').style.display = 'none';
         document.getElementById('toAddNewParam').style.display = 'none';
         document.getElementById('tableParametr').style.display = 'none';
      }
      else if(method === 'metOptions')   
      {
         document.getElementById('req_Body').style.display = 'none';
         document.getElementById('toAddNewParam').style.display = 'none';
         document.getElementById('tableParametr').style.display = 'none';
      }  
      return true;
     }
      //****Составление новой строки таблицы параметров 
     function addParams(e){
       e.preventDefault();
       var tabParam = document.querySelector("#tableParametr > tbody");
       var addName1 =  "newParam";//document.querySelector("#tableParametr > tbody > tr:nth-child(2) > td:nth-child(1) > input").name; 
       var addVal1 =  "newParamVal";//document.querySelector("#tableParametr > tbody > tr:nth-child(2) > td:nth-child(2) > input").name; 
       var tr1 = document.createElement("tr");
       var new1 = addTdBut(tr1, addName1);
       var new2 = addTdBut(tr1, addVal1);
       var new3 = addTdA(tr1);
       tabParam.appendChild(tr1);  
     }
     //*****Составление и добавление новой строки в таблицу запросов
     function addHead(e){
       e.preventDefault();
       var tabParam = document.querySelector("#tableHeaders > tbody");
       var addName1 =  "reqHead";//document.querySelector("#tableHeaders > tbody > tr:nth-child(2) > td:nth-child(1) > input").name; 
       var addVal1 =  "reqHeadVal";//document.querySelector("#tableHeaders > tbody > tr:nth-child(2) > td:nth-child(2) > input").name; 
       var tr1 = document.createElement("tr");
       var new1 = addTdBut(tr1, addName1);
       var new2 = addTdBut(tr1, addVal1);
       var new3 = addTdA(tr1);
       tabParam.appendChild(tr1);  
     }
     //****Добавление нового инпута в таблицу
        function addTdBut(newTr, NameEl){
             var td1 = document.createElement("td");
             var inp1 = document.createElement("input");
             inp1.name = NameEl;
             td1.appendChild(inp1);
             newTr.appendChild(td1);   
        }
     //****Добавление ссылки "Удалить" в таблицу   
        function addTdA(newTr){
             var td1 = document.createElement("td");
             var link1 = document.createElement("a");
             link1.innerHTML = 'Удалить';
             link1.style.color = 'red';
             link1.addEventListener("click", function(e){
                 this.closest('tr').remove()});
             td1.appendChild(link1);   
             newTr.appendChild(td1);
        }
       
       //*****отстроили левую часть с сохраненными запросами при первом запуске страницы
      fetch('/leftpartREAD',{
             method: 'GET'
         })
         .then(function(response){ return response.json();})
         .then(function(json) {
             addNewButton(json, 0)
         return json;})
         .then(function(){
             let method = document.getElementById('reqMethod');
             method.addEventListener('change',changeMet ,false);
         })
         .then(console.log("Страница отстроена!"));
               
     //сохранили новый запрос  
     function getUpdateItems(){
     let item0 = document.getElementById('reqMethod');
     var item1 = item0.options[item0.selectedIndex].innerHTML;
     let item2 = document.getElementById('textURL').value;
     let item3= new Array;
     let item6  = new Array;
     let item8 = document.getElementById('idDelCen').value;
     for(var i=0;i<document.getElementsByName('newParam').length; i++)
     {
         item3[i] ={[document.getElementsByName('newParam')[i].value] : document.getElementsByName('newParamVal')[i].value};
     }
     let item5 = document.getElementById('reqBody').value;
     for(var i=0;i<document.getElementsByName('reqHead').length; i++)
     {
         item6[i] = {[document.getElementsByName('reqHead')[i].value] : document.getElementsByName('reqHeadVal')[i].value} 
     } 
     
     var allItems ={
         "item1":item1,
         "item2":item2,
         "item3":item3,
         "item4":"item4",
         "item5":item5,
         "item6":item6,
         "item7":"item7",
         "item8":item8
     }
     return allItems;
     }
     
     async function addnewfetch()
     {
     let newItems = getUpdateItems();
     //console.log(item1, item2, item3, item4, item5, item6, item7);
     let res = await  fetch('/leftpartWRITE',{
             method: 'POST',
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({"reqMethod": newItems.item1,
             "textURL": newItems.item2,
             "newParam": newItems.item3,
           //  "newParamVal": newItems.item4,
             "reqBody": newItems.item5,
             "reqHead": newItems.item6,
           //  "reqHeadVal": newItems.item7,
             "num": newItems.item8
             })
         })
         .then(console.log('Данные отправлены'))
         .then(response = await fetch('/leftpartREAD', {method: 'GET'}))
         .then(response => response.json())
         .then(data = await response.json())
         .then(console.log('Получили данные', data))
         .then(addNewButton(data, data.length-1));
     }
     
     //****Сохранили новый запрос v конфигурационный лист
     function addNewButton(itemsForm, x){
     let myLeft = document.getElementById('leftPart');
     let butLeft = document.querySelectorAll('#leftPart input');
     
     //console.log('butLeft',butLeft);
     //console.log('itemsForm',itemsForm);
     for(var i = x; i < itemsForm.length; i++)
         {
         let newBut = document.createElement('input');            
         let newBr = document.createElement('br'); 
         newBut.type = 'button';
         newBut.value = 
        `Метод: ${itemsForm[i]['method']}
         URL: ${itemsForm[i].url}`;
         newBut.className = 'for_button';
         newBut.id = "idItem" + itemsForm[i]["num"];
         myLeft.appendChild(newBut);
         myLeft.appendChild(newBr); 
         }
         var a = changeMet();
        
        // console.log(a);
     }
     //***отстроили настройки из выбранного, ранее сохраненного запроса 
     function configToForm(input){
         
         let curID = input.id;
         curID=curID.slice(6);
     //krasota
      let allButtons = document.getElementsByClassName('for_button');
         for(var i=0; i< allButtons.length; i++)
          {
             if(allButtons[i].id != input.id)
                {
                 allButtons[i].style.backgroundColor = 'rgb(0, 194, 113)';
                 allButtons[i].style.color = 'black';
                 allButtons[i].style.border = 'none';
                }
             else {
                 allButtons[i].style.backgroundColor = 'grey';
                 allButtons[i].style.color = 'white';
                 allButtons[i].style.border = '3px solid rgb(0, 194, 113)';
             } 
          }
         
         
         
         fetch('/leftpartREAD',{
             method: 'GET'
         })
         .then(function(response){ return response.json();})
         .then(function(json) {
             let itemsForm = json;
             for(var i=0; i<itemsForm.length; i++)
                {
               //  console.log(itemsForm[i]['num'], parseInt(curID),curID);
                 if(itemsForm[i]['num'] === parseInt(curID)) 
                   var curIdEl = i;
                }
        // console.log(itemsForm, curIdEl, itemsForm[curIdEl]);
         //заполнили форму: метод, урл, боди
         console.log("curID",curID);
        let selectLen = document.getElementById('reqMethod').options.length;
        for(var i=0; i < selectLen; i++)
         {
         if(document.getElementById('reqMethod').options[i].innerHTML === itemsForm[curIdEl]['method'])
             document.getElementById('reqMethod').selectedIndex = [i];
         }
     
         //document.getElementById('reqMethod').options[document.getElementById('reqMethod').selectedIndex].innerHTML = itemsForm[curIdEl]['method'];
         document.getElementById('textURL').value = itemsForm[curIdEl]['url'];
         document.getElementById('reqBody').innerHTML = itemsForm[curIdEl]['body'];
         document.getElementById('idDelCen').innerHTML = itemsForm[curIdEl]['num'];
         //подготовили форму под нужное количество параметров и заполнили
         let param = JSON.parse(itemsForm[curIdEl]['param']);
         let paramLen = Object.keys(JSON.parse(itemsForm[curIdEl]['param'])).length;
         let tdLen = document.getElementsByName('newParam').length;
     
        // console.log("paramLen", paramLen, tdLen);
         if(paramLen > tdLen){
             let countNewTd = paramLen - tdLen;
             for(var i = 0; i<countNewTd; i++)
                 document.getElementById('addParamInTable').click();
         }
         else if(paramLen < tdLen){
             for(var i = tdLen; i > paramLen; i--)
                 document.querySelector('#tableParametr>tbody>tr:nth-child('+(tdLen + 1)+')>td:nth-child(3)>a').click();
         }
         var i=0;
         for(var i=0; i<param.length; i++)
         {
         for(param[i].key in param[i]){
          //   console.log("key", param[i].key, param);
             document.getElementsByName('newParam')[i].value = param[i].key;
             document.getElementsByName('newParamVal')[i].value = param[i][param[i].key];
           //  i++;
         }}
     //подготовили форму под нужное количество запросов
         let objHead = JSON.parse(itemsForm[curIdEl]['head']);
         let objHeadLen = Object.keys(JSON.parse(itemsForm[curIdEl]['head'])).length;
         let tdHeadLen = document.getElementsByName('reqHead').length;
     
         if(objHeadLen > tdHeadLen){
             let countNewTd = objHeadLen - tdHeadLen;
             for(var i = 0; i<countNewTd; i++)
                 document.getElementById('addHeaderInTable').click();
         }
         else if(objHeadLen < tdHeadLen){
             for(var i = tdHeadLen; i > objHeadLen; i--)
                 document.querySelector('#tableHeaders>tbody>tr:nth-child('+(tdHeadLen + 1)+')>td:nth-child(3)>a').click();
         }
     
         for(var i=0; i<objHead.length; i++)
         {
         for(objHead[i].key in objHead[i]){
          //   console.log(objHead[i].key, objHead);
             document.getElementsByName('reqHead')[i].value = objHead[i].key;
             document.getElementsByName('reqHeadVal')[i].value = objHead[i][objHead[i].key];
         }}
         document.getElementById('controlConfig').style.opacity = 1;
         let linkCh = document.querySelector("#changeItemLeftPart");
             linkCh.addEventListener("click", (event) => {addFetchChange();});
         let linkDel = document.querySelector("#delItemLeftPart");
             linkDel.addEventListener("click", (event) => {addFetchDel();});
         });
         var a = changeMet();
         //curID=0;
     }
     //***внесли изменения в запрос
     async function addFetchChange(event){
        // e.preventDefault;
              
         let newItems = getUpdateItems();
         //console.log(newItems);
         //alert(item1);
      
         let num = document.getElementById('idDelCen').innerHTML;
         let res = await fetch('/change',{
             method: 'POST',
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({"reqMethod": newItems.item1,
             "textURL": newItems.item2,
             "newParam": newItems.item3,
             "newParamVal": newItems.item4,
             "reqBody": newItems.item5,
             "reqHead": newItems.item6,
             "reqHeadVal": newItems.item7,
             "allItemsForm": newItems,
             "num": num})
         })
         .then(console.log('Внесены изменения в запрос v' , num));
          fetch('/leftpartREAD',{
             method: 'GET'
         })
         .then(function(response){ return response.json();})
         .then(function(json) {
             let itemsForm = json;
             let myLeft = document.getElementById('leftPart');
             let butLeft = document.querySelectorAll('#leftPart input');
     
             for(var i = 0; i < butLeft.length; i++)
                 {
                 butLeft[i].value = 
                 `Метод: ${itemsForm[i]['method']}
                 URL: ${itemsForm[i].url}`;
                 butLeft[i].className = 'for_button';
                 butLeft[i].id = "idItem" + itemsForm[i]["num"];
                 }
                 })
     }
     //****удалили запрос
     async function addFetchDel(){
     
     let num = document.getElementById('idDelCen').innerHTML;
         let res = await fetch('/delete',{
             method: 'POST',
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({"num": num})
         })
         .then(console.log('Запрос № '+ num +'удален'));
         fetch('/leftpartREAD',{
             method: 'GET'
         })
         .then(function(response){ return response.json();})
         .then(function(json) {
             let itemsForm = json;
             let myLeft = document.getElementById('leftPart');
             let butLeft = document.querySelectorAll('#leftPart input');
             if(itemsForm.length < butLeft.length)
                 butLeft[0].remove();
             for(var i = 0; i < itemsForm.length; i++)
                 {
                 butLeft[i].value = 
                 `Метод: ${itemsForm[i]['method']}
                 URL: ${itemsForm[i].url}`;
                 butLeft[i].className = 'for_button';
                 butLeft[i].id = "idItem" + itemsForm[i]["num"];
                 }
                 clearForm();
                 })
     }
     
     
     //****очистка формы
     function clearForm(){
         if(document.querySelector('#rightPart  #textURL').value != '')
           document.querySelector('#rightPart  #textURL').value = '';
         if(document.querySelectorAll('#rightPart  #tableParametr  input').length > 0)    
           {   
             var a = document.querySelectorAll('#rightPart  #tableParametr  input');
                 if(a.length >0)  
                 {
                 for(var i=0; i<a.length; i++)
                     a[i].value = '';
            }}
     
         if(document.querySelector('#rightPart  #req_Body  textarea').value !='')
             document.querySelector('#rightPart  #req_Body  textarea').value = '';    
         if(document.querySelectorAll('#rightPart  #tableHeaders  input').length > 0)    
             {
             var b = document.querySelectorAll('#rightPart  #tableHeaders  input');
             if(b.length > 0)  
             {
             for(var i=0; i<b.length; i++)
                 b[i].value = '';
             }}
     
         if( document.querySelectorAll('#rightPart  #resReq  span').length > 0)
             {
             var c = document.querySelectorAll('#rightPart  #resReq  span');
             if(c.length > 0)  
             {
             for(var i=0; i<c.length; i++)
                 c[i].value = '';
             }}
     
         if(document.querySelector('#rightPart  #resReq  textarea'))
             document.querySelector('#rightPart  #resReq  textarea').innerHTML = ''; 
     }
     
     function newReq(){
         document.getElementById('resReq').style.display = 'block';    
     let newItems = getUpdateItems();    
     let fBody = document.getElementById("textBody");
     let newStr='</br>';
     //console.log("newItems",newItems);
     fetch('/run', {
         method: 'POST',
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({"allItemsForm": newItems})
     })
     .then(function(response){return response.json();})
     .then(function(json){
         let getItems = json;
         //console.log("getItems", getItems['hd'].length, getItems['hd'][0]);
         document.getElementById('statusReq').innerHTML = getItems['st'];
         document.getElementById('okReq').innerHTML = getItems['ok'];
         if(getItems['hd'])
         for(var i=0;i< getItems['hd'].length; i=i+2){
             newStr= newStr + getItems['hd'][i] +' - ' + getItems['hd'][i+1] + ';' + '</br>';
         }
         document.getElementById('getHeadReq').innerHTML=newStr;
         document.getElementById('getHeadReq').style.color = 'blue';
         if(newStr.includes("content-type - text/html")) //HTML? делаем превью страницы
         {
             document.getElementById('output').style.display = 'block';
             document.getElementById('resPic').style.display = 'none';
             document.getElementById('getBodyReq').innerHTML = getItems['body'];
             var x = document.getElementById('getBodyReq').value;
             document.getElementById("output").srcdoc  = "<!doctype html> <html>" + x + "</html>";
         }    
         else if(newStr.includes("content-type - image/")) //картинка? делаем превью страницы
         {
             document.getElementById('resPic').style.display = 'block';
             document.getElementById('output').style.display = 'none';
             document.getElementById('getBodyReq').innerHTML = getItems['body'];
             document.getElementById('resPic').src = getItems['body'];
         }    
         else
         {
             document.getElementById('resPic').style.display = 'none';
             document.getElementById('output').style.display = 'none';
             document.getElementById('getBodyReq').innerHTML = getItems['body'];
         }    
     });
     
     }
     