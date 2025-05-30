    
async function startRun(){
  let rezTable = document.getElementById('user_res_full');
  let rezTablerows = document.querySelectorAll('#user_res_full tr') || 'no';  
  if(rezTablerows != 'no')
    rezTablerows.forEach(row => {
        rezTable.deleteRow(row);
    });
  let userReq = document.getElementById('field_req').value;
  let selTabl = document.getElementById('selTable').value;
  //console.log('selTabl', selTabl);
  await  fetch('/run',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"userReq": userReq, "selTabl": selTabl
        })
    })
    .then(console.log('Данные отправлены'))
    .then(function(response){ return response.json();})
    .then(async function(json) 
         {
            console.log(json);
          let  data = json;
          console.log('Получили данные', data);    
          //create table      
          var trHead = document.createElement("tr");
          var trRez = new Array, tdRez = new Array;
          //добавили заголовки
          var tdHead = document.createElement("th");
              tdHead.innerHTML = '№';
              trHead.appendChild(tdHead);
          for(key in data)
             { 
             var tdHead = document.createElement("th");
             tdHead.innerHTML = key;
             trHead.appendChild(tdHead); 
             var count = data[key].length; 
             console.log(count);  
             }  

             rezTable.appendChild(trHead);     
          //наполняем таблицу 
          for(var i = 0; i<count; i++)
            {
             trRez[i] = document.createElement("tr"); 
             tdRez[i] = document.createElement("td");
             tdRez[i].innerHTML = i+1;
             trRez[i].appendChild(tdRez[i]);  
             for(key in data)
             {  
                tdRez[i] = document.createElement("td");
                tdRez[i].innerHTML = data[key][i];
                trRez[i].appendChild(tdRez[i]);
             }
             rezTable.appendChild(trRez[i]);
            }  
        });
}
async function showTabls(){
    console.log('pysk');
    await fetch('/showAll',{
        method: 'POST',
        headers: { "Content-Type": "application/json" }
        })
    .then(console.log('Список таблиц получен'))
    .then(function(response){ return response.json();})
    .then(function(json){ 
        let alitems = document.getElementById('selTable');
        for (var i = 0; i < json.length; i++) {
            var option = document.createElement("option");
            option.value = json[i];
            option.text = json[i];
            alitems.appendChild(option);
            }
    });
}
showTabls();
