import { ApiResponse, UserAttributes, VidAttributes, FlowerAttributes, FlowerImgsAttributes, FlowerInfoAttributes } from '../models/models';

// Глобальные переменные для пагинации и режимов админки
let currentMode: 'flowers' | 'vids' | 'flowersPhoto' | 'flowersDiscription' | 'users' = 'users';
let currentPage: number = 1;
const itemsPerPage: number = 9;


document.addEventListener('DOMContentLoaded', () => {
  const cancelBut = document.getElementById('control_modal_cancel');
if (cancelBut) {
    cancelBut.addEventListener('click', () => {
        closeItem('adminUniversalModal');
    }, false);
}
const saveBut = document.getElementById('control_modal_save');
if (saveBut) {
    saveBut.addEventListener('click', () => {
        // Проверяем по наличию ID в форме, что мы делаем: редактируем или создаем новое
        const flowerIdEl = document.getElementById('modal_flower_id');
        const vidIdEl = document.getElementById('modal_vid_id');
        
        // Если в форме есть ID и это не текст "Автоинкремент" — значит, это РЕДАКТИРОВАНИЕ
        const isEditFlower = flowerIdEl && flowerIdEl.innerHTML !== 'Автоинкремент' && flowerIdEl.innerHTML !== '';
        const isEditVid = vidIdEl && vidIdEl.innerHTML !== '';
        const isEditUser = (currentMode === 'users');

        if (isEditFlower || isEditVid || isEditUser) {
            correctItem(); // Вызываем сохранение изменений
        } else {
            addItemSaveUniversal(); // Вызываем создание новой записи
        }
    }, false);
  }


    // Кнопка "Назад" (<<)
    const preBtn = document.getElementById('pre');
    if (preBtn) {
        preBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                if (currentMode === 'users') correctUsers(currentPage);
                  else if (currentMode === 'flowers') correctFlowers(currentPage);
                    else if (currentMode === 'vids') correctVids(currentPage);
            }
        });
    }

    // Кнопка "Вперед" (>>)
    const nextBtn = document.getElementById('next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentPage++;
            if (currentMode === 'users') correctUsers(currentPage);
            else if (currentMode === 'flowers') correctUsers(currentPage);
            else if (currentMode === 'vids') correctUsers(currentPage);            
        });
    }


   document.getElementById('control_services_user')?.addEventListener('click', () => {
        currentMode = 'users'; // <--- ЗАДАЛИ РЕЖИМ ПОЛЬЗОВАТЕЛЕЙ
        correctUsers(1);       // Запустили прорисовку таблицы пользователей
    });

    // Кликнули на вкладку "Цветы"
    document.getElementById('control_services_flower')?.addEventListener('click', () => {
        currentMode = 'flowers'; // <--- ЗАДАЛИ РЕЖИМ ЦВЕТОВ
        correctFlowers(1);       // Функция, которая отрисует таблицу цветов
    });

    // Кликнули на вкладку "Виды"
    document.getElementById('control_services_vid')?.addEventListener('click', () => {
        currentMode = 'vids';    // <--- ЗАДАЛИ РЕЖИМ ВИДОВ
        correctVids(1);         // Функция для таблицы видов
    });



});

async function correctFlowers(page: number = 1): Promise<void> {
  currentPage = page;
  currentMode = 'flowers';

  const btnUser = document.getElementById('control_services_user') as HTMLElement;
  const btnVid = document.getElementById('control_services_vid') as HTMLElement;
  const btnFlower = document.getElementById('control_services_flower') as HTMLElement;

  if (btnUser) btnUser.style.border = 'none';
  if (btnVid) btnVid.style.border = 'none';
  if (btnFlower) btnFlower.style.border = '4px solid #333';

  const serviceAdd = document.getElementById('service_add');
  const pageView = document.getElementById('pageView');

  if (serviceAdd) serviceAdd.style.display = 'none';
  if (pageView) pageView.style.display = 'flex';

 let buttonForAdd = document.getElementById('addNewItemFlower_but') as HTMLElement || null;
 if (buttonForAdd) buttonForAdd.remove();
   
  
  const table = document.getElementById('control_table') as HTMLTableElement | null; 
  if (table) {
    while (table.rows.length > 0) {
        table.deleteRow(0);
      }
    const butAdd = document.createElement("input");
        butAdd.type = 'button';
        butAdd.id = 'addNewItemFlower_but';
        butAdd.style.background = 'none';
        butAdd.value = '⊕ Добавить товар(цветок)';
    table.appendChild(butAdd);   
 //   const addFlbutton = document.getElementById('addNewItemFlower_but') as HTMLButtonElement || null;  
    document.getElementById('addNewItemFlower_but')?.addEventListener('click', event => {addItemUniversal(event)}, false);    
  }


 const localToken = localStorage.getItem('floweridaKey');

  fetch(`/api/flower/getAll?page=${page}&limit=${itemsPerPage}`,{
        method: "GET",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
        })
        .then((response) => response.json())
        .then((data : ApiResponse<FlowerAttributes>) =>{
           if(data.mes || data.message){
            const mistake = document.getElementById('mist3') as HTMLElement || null
            if(mistake) mistake.innerHTML = String(data.mes || data.message);
            return ;
           }
           
           if (table && data.rows) {
              console.log(data);
              var trHead = document.createElement("tr");
                  trHead.className = 'newTr'

              //добавили заголовки
            const headers = ['Удалить', 'Изменить', 'Название', 'Цена', 'Вид', 'Изображения', 'Описание', 'mKeyWords', 'mDiscription'];
                    headers.forEach(text => {
                        const th = document.createElement("th");
                        th.innerHTML = text;
                        trHead.appendChild(th);
                    });
            table.appendChild(trHead);  
                             
            data.rows.forEach((flower, index) => {
                const num = index + 1;
                const tr = document.createElement("tr");
                tr.className = 'newTr';

                tr.innerHTML = `
                    <td><input type="button" class="class_control_button" value="Удалить запись" id="butDelete${num}"></td>
                    <td><input type="button" class="class_control_button" value="Изменить запись" id="butChange${num}"></td>
                    <td>${flower.id}</td>
                    <td>${flower.name}</td>
                    <td>${flower.price}</td>
                    <td>${flower.vidId || ''}</td>
                    <td><input type="button" class="class_control_button" value="⇓ Добавить фото" id="butChangeImg${num}"></td>
                    <td><input type="button" class="class_control_button" value="+ Добавить описание" id="butChangeDisc${num}"></td>
                    <td>${flower.mKeyWords || ''}</td>
                    <td>${flower.mDiscript || ''}</td>
                `;
                table.appendChild(tr);

                // Активация базовых кнопок строки
                document.getElementById(`butDelete${num}`)?.addEventListener('click', (e) => { deleteItemUniversal(e); });    
                document.getElementById(`butChange${num}`)?.addEventListener('click', (e) => { showChange(e); });    

                document.getElementById(`butChangeImg${num}`)?.addEventListener('click', (event : Event) => {imgItemFlower(event)}, false);   
                document.getElementById(`butChangeDisc${num}`)?.addEventListener('click',  (event : Event) => {discItemFlower(event)}, false);

            });   
                  
           const numPageInput = document.getElementById('numPage') as HTMLInputElement | null;
             if (numPageInput) numPageInput.value = String(page);
           } 
        }).catch((error)=> console.log(error));

}
async function correctVids(page: number = 1): Promise<void> {

currentPage = page;
currentMode = 'vids';

const btnUser = document.getElementById('control_services_user') as HTMLElement;
const btnVid = document.getElementById('control_services_vid') as HTMLElement;
const btnFlower = document.getElementById('control_services_flower') as HTMLElement;

if (btnUser) btnUser.style.border = 'none';
if (btnVid) btnVid.style.border = '4px solid #333';
if (btnFlower) btnFlower.style.border = 'none';

const serviceAdd = document.getElementById('service_add');
const pageView = document.getElementById('pageView');

if (serviceAdd) serviceAdd.style.display = 'none';
if (pageView) pageView.style.display = 'flex';


//проверяем - кнопка для добавления нового вида уже есть на странице
let buttonForAdd = document.getElementById('addNewVidItem_but') as HTMLElement || null;
  if (buttonForAdd) buttonForAdd.remove();
   
  
  const table = document.getElementById('control_table') as HTMLTableElement | null; 
  if (table) {
    while (table.rows.length > 0) { table.deleteRow(0); }
  const butAdd = document.createElement("input");
      butAdd.type = 'button';
      butAdd.id = 'addNewVidItem_but';
      butAdd.style.background = 'none';
      butAdd.value = '⊕ Добавить вид';
  table.appendChild(butAdd);     
  table.addEventListener('click', (event : Event) => {addItemUniversal(event);}, false);   
  }

  const localToken = localStorage.getItem('floweridaKey');
   
   fetch(`/api/vid/getAll?page=${page}&limit=${itemsPerPage}`,{
        method: "GET",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
        })
        .then((response) => response.json())
        .then((data: ApiResponse<VidAttributes>) =>{
           const mist3 = document.getElementById('mist3');
           if(data.mes || data.message){
                 if (mist3) mist3.innerHTML = data.mes || data.message || 'Ошибка';
                 return;
           }
           if (table && data.rows) {
              console.log(data);
              var trHead = document.createElement("tr");
                  trHead.className = 'newTr'

              //добавили заголовки
              const headers = ['Удалить', 'Изменить', 'Id', 'Вид'];
                    headers.forEach(text => {
                        var th = document.createElement("th");
                        th.innerHTML = text;
                        trHead.appendChild(th);
                    });
              table.appendChild(trHead);  
                                    
            data.rows.forEach((vid, index) => {
                const num = index + 1;
                const tr = document.createElement("tr");
                tr.className = 'newTr';

                tr.innerHTML = `
                    <td><input type="button" class="class_control_button" value="Удалить запись" id="delChange${num}"></td>
                    <td><input type="button" class="class_control_button" value="Изменить запись" id="butChange${num}"></td>
                    <td>${vid.id}</td>
                    <td>${vid.name}</td>
                `;
                table.appendChild(tr);    

                document.getElementById(`butChange${num}`)?.addEventListener('click', (e) => { showChange(e); });
                document.getElementById(`delChange${num}`)?.addEventListener('click', (e) => { deleteItemUniversal(e); });            
            }) 
            }
            const numPageInput = document.getElementById('numPage') as HTMLInputElement | null;
            if (numPageInput) {
                numPageInput.value = String(page);
            }

             //   document.getElementById('butChange' + num)?.addEventListener('click', event => {vidChange(event)}, false);            
        }).catch((error : any)=> console.log(error));
}
//нажали кнопку Пользователи
async function correctUsers(page: number = 1): Promise<void> {

currentPage = page;
currentMode = 'users';

 const btnUser = document.getElementById('control_services_user') as HTMLElement;
 const btnVid = document.getElementById('control_services_vid') as HTMLElement;
 const btnFlower = document.getElementById('control_services_flower') as HTMLElement;

if (btnUser) btnUser.style.border = '4px solid #333';
if (btnVid) btnVid.style.border = 'none';
if (btnFlower) btnFlower.style.border = 'none';

const serviceAdd = document.getElementById('service_add');
const pageView = document.getElementById('pageView');

if (serviceAdd) serviceAdd.style.display = 'none';
if (pageView) pageView.style.display = 'flex'; // Показываем блок пагинации << 1 >>

const localToken = localStorage.getItem('floweridaKey');

const table = document.getElementById('control_table') as HTMLTableElement | null; 
if (table) {
  while (table.rows.length > 0) {
       table.deleteRow(0);
     }
}

  fetch(`/api/user/allUsers?page=${page}&limit=${itemsPerPage}`,{
        method: "GET",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
        })
        .then((response) => response.json())
        .then((data: ApiResponse<UserAttributes>) =>{
           const mist3 = document.getElementById('mist3');
           if(data.mes || data.message){
                 if (mist3) mist3.innerHTML = data.mes || data.message || 'Ошибка';
                 return;
           }
           if (table && data.rows) {
              console.log(data);
              var trHead = document.createElement("tr");
                  trHead.className = 'newTr'

              //добавили заголовки
            const headers = ['Изменить', 'Имя пользователя', 'Почта', 'Роль', 'Статус'];
                    headers.forEach(text => {
                        var th = document.createElement("th");
                        th.innerHTML = text;
                        trHead.appendChild(th);
                    });
            table.appendChild(trHead);  

            // Заполняем строки данными                                    
            data.rows.forEach((user, index) => {
                const num = index + 1;
                const tr = document.createElement("tr");
                tr.className = 'newTr';

                tr.innerHTML = `
                    <td><input type="button" class="class_control_button" value="Изменить запись" id="butChange${num}"></td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.user_status}</td>
                `;
                table.appendChild(tr);    

                // Навешивание обработчика изменений на каждую кнопку индивидуально
                document.getElementById(`butChange${num}`)?.addEventListener('click', (e) => { showChange(e); });            
            });  
            }
            const numPageInput = document.getElementById('numPage') as HTMLInputElement | null;
            if (numPageInput) {
                numPageInput.value = String(page);
            }
        }).catch((error)=> console.log(error));
}

//Нажали Добавить-просмотреть фото товар - цветок
function imgItemFlower(event :Event) : void{

currentMode = 'flowersPhoto';
showChange(event);

// Навешиваем клик на созданную кнопку
  const btnAdd = document.getElementById('modalAddPhotoBtn') as HTMLInputElement | null;
  const fileInput = document.getElementById('modalAddPhotoInput') as HTMLInputElement | null;

  btnAdd?.addEventListener('click', () => fileInput?.click());
    
  fileInput?.addEventListener('change', (e: Event) => {
        addFileUniversal(e, linkId, event); // Передаем исходный event, чтобы потом обновить окно
    });

  const target = event.target as HTMLElement | null;
  if (!target) return;

  let targetId = target.id;
  let linkIdChange = targetId.replace('butChangeImg', '');
  let flowerId =  linkIdChange ? parseInt(linkIdChange) + 1 : 0;  

  let table = document.getElementById('myModalTableFlowerImg') as HTMLTableElement | null;;
  if (table) {
      while (table.rows.length > 0) {
          table.deleteRow(0);
      }
  }


const localToken = localStorage.getItem('floweridaKey');
fetch(`/api/imgs/getAll/${flowerId}`,{
        method: "GET",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
        })
        .then((response) => response.json())
        .then((data :ApiResponse<FlowerImgsAttributes>) =>{
            if(data.mes || data.message){
              const mistake = document.getElementById('modalMistake') as HTMLElement || null;
              if(mistake) mistake.innerHTML = String(data.mes || data.message);
              return ;
            }
           if (table && data.rows) {
            data.rows.forEach((images, index) => {
                const numImg = index + 1;
                const tr = document.createElement("tr");
                tr.className = 'newTr';
                tr.innerHTML = `
                    <td><input type="button" class="class_control_button" value="Удалить" id="delImg${numImg}"></td>
                    <td>
                        <div><img id="img${numImg}" src="/imgStoreMINI/${images.img}" width="50"></div>
                        <span id="spanID${numImg}" style="display:none">${images.id || ''}</span>
                        <span id="spanName${numImg}" style="display:none">${images.img}</span>
                    </td>
                    <td style="padding-bottom:25px">${images.num}</td>
                `;
                table.appendChild(tr);
                document.getElementById('delImg' + numImg)?.addEventListener('click', (e: Event) => { delOneImgDB(e); });
            });  
        }  
    })
    .catch((error) => console.error('Ошибка загрузки картинок:', error));
}

//add pic
async function addFileUniversal(e: Event, flowerId: number, originalEvent: Event): Promise<void> {
    const fileInput = e.target as HTMLInputElement | null;
    const status = document.getElementById('uploadStatus') as HTMLElement | null;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]); // Передаем выбранный файл

    // Считаем текущее количество картинок в таблице для инкремента num
    const num: number = document.querySelectorAll('#myModalTableFlowerImg > tr').length + 1;

    if (status) {
        status.style.color = '#666';
        status.innerHTML = 'Загрузка...';
    }

    const localToken = localStorage.getItem('floweridaKey');

    try {
        // Шаг 1: Загружаем картинку на бэкенд для нарезки через GraphicsMagick
        const uploadResponse = await fetch('/uploads', {
            method: "POST",
            headers: { "Authorization": `Bearer ${localToken}` },
            body: formData
        });

        const imageName = await uploadResponse.text();

        // Шаг 2: Создаем запись связи картинки и цветка в базе данных
        const dbResponse = await fetch('/api/imgs/create', {
            method: "POST",
            headers: { 
                "content-Type": "application/json", 
                "Authorization": `Bearer ${localToken}` 
            },
            body: JSON.stringify({
                'flowerId': flowerId,
                'img': imageName,   // Имя сохраненного файла
                'num': num
            })
        });

        const dbData = await dbResponse.json();

        if (dbData.mes || dbData.message) {
            if (status) {
                status.style.color = 'red';
                status.innerHTML = String(dbData.mes || dbData.message);
            }
        } else {
            if (status) {
                status.style.color = '#4caf50';
                status.innerHTML = 'Успешно добавлено!';
            }
            if (fileInput) fileInput.value = ''; // Очищаем поле выбора файла
            
            // Перезапускаем главное окно, чтобы таблица обновилась
            imgItemFlower(originalEvent);
        }

    } catch (error) {
        console.error('Ошибка в addFileUniversal:', error);
        if (status) {
            status.style.color = 'red';
            status.innerHTML = 'Ошибка соединения с сервером';
        }
    }
}
//del img db
async function delOneImgDB(event){
const localToken = localStorage.getItem('floweridaKey');
  let targetId = event.target.id;
  let linkId = targetId.replace('delImg', '');
  linkId = parseInt(linkId)*3;  
  console.log('1', linkId);
  let id = document.getElementById('spanID' +linkId).innerHTML;
  let name = document.getElementById('spanName' +linkId).innerHTML;



 fetch('/api/imgs/delete',{
          method: "POST",
          headers: {"content-Type": "application/json", "Authorization": localToken},
          body: JSON.stringify({'id': id})
          })
          .then((response) => response.json())
          .then(data =>{
            if(data.mes || data.message)
              document.getElementById('mist7').innerHTML = data.mes || data.message;
            else 
                {
                 fetch('/deleteImg',{
                  method: "POST",
                  headers: {"content-Type": "application/json", "Authorization": localToken},
                  body: JSON.stringify({'name': name})
                  })
                  .then((response) => response.json())
                  .then(data =>{
                    if(data.mes || data.message)
                      document.getElementById('mist7').innerHTML = data.mes || data.message;
                    else 
                   imgItemFlower(event);
                  }); 
                }    
          });
}


////Нажали Добавить-описание товара
async function discItemFlower(event): Promise<void> {
  currentMode = 'flowersDiscription';
  showChange(event);

  const btnAdd = document.getElementById('modalAddDiscriptionBtn') as HTMLInputElement | null;

  btnAdd?.addEventListener('click', (event) => {addItemUniversal(event);});

  const target = event.target as HTMLElement | null;
  if (!target) return;

    const trId = target.id;
    const trNumChange = trId.replace('butChangeDisc', '');
    const flowerId = trNumChange ? parseInt(trNumChange) + 1 : 0
    
  let table = document.getElementById('myModalTableFlowerDis') as HTMLTableElement | null;;
  if (table) {
      while (table.rows.length > 0) {
          table.deleteRow(0);
      }
  }

const mistake = document.getElementById('modalMistake') as HTMLElement || null;
 if(flowerId != 0) {
  mistake.innerHTML = 'Не указан товар. Добавление описания товара не возможно!';

}
 else{
    const localToken = localStorage.getItem('floweridaKey');
  fetch('/api/info/getAll/${flowerId}',{
        method: "GET",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
        })
        .then((response) => response.json())
        .then((data:ApiResponse<FlowerInfoAttributes>) =>{
            if(data.mes || data.message){
              const mistake = document.getElementById('modalMistake') as HTMLElement || null;
              if(mistake) mistake.innerHTML = String(data.mes || data.message);
              return ;
            }
            if (table && data.rows) {
              data.rows.forEach((info, index) => {
                const numInf = index + 1;
                const tr = document.createElement("tr");
                tr.className = 'newTr';
                tr.innerHTML = `
                    <td><input type="button" class="class_control_button" value="Название блока" id="delImg${numInf}">${info.title}</td>
                    <td class="countBlocks"><input type="text" class="inputInfo" id="title${numInf}"></td>

                `;
                table.appendChild(tr);
                document.getElementById('delImg' + numImg)?.addEventListener('click', (e: Event) => { delOneImgDB(e); });
            });  
        }  
    })
    .catch((error) => console.error('Ошибка загрузки картинок:', error));

}

function addDiscr(){
getDiscr();
document.querySelector('#table_flower_info > tr:last-child > td:nth-child(2) > input').addEventListener('click', event => {delOneDiscription(event);});


}
function delOneDiscription(event){
  let targetId = event.target.id;
  let linkId = targetId.replace('link', '');
  linkId = parseInt(linkId); 
  const table = document.getElementById('table_flower_info');

for(var i=linkId; i>linkId-3; i--)
    table.removeChild(table.rows[linkId-3]);
  
}
//добавить одно описание - нажали кнопку Добавить
async function getDiscr(){
let count = document.querySelectorAll('#table_flower_info > tr').length;
count = count+3;
   var trTitle = document.createElement("tr");
   var tdTitle1 = document.createElement("td");
       tdTitle1.innerHTML = 'Название блока';
       trTitle.appendChild(tdTitle1);
   var tdTitle11 = document.createElement("td");       
       tdTitle11.className = 'countBlocks';
   var inputTitle = document.createElement("input");
       inputTitle.type = 'text';
       inputTitle.className = 'inputInfo';
       inputTitle.id = 'title' + count;

       tdTitle11.appendChild(inputTitle);
       trTitle.appendChild(tdTitle11);

  var trTitle2 = document.createElement("tr");    
  var tdTitle2 = document.createElement("td");      
      tdTitle2.innerHTML = 'Описание блока';
      trTitle2.appendChild(tdTitle2);
  var tdTitle22 = document.createElement("td");      
  var areaDisc = document.createElement("textarea");
      areaDisc.className = 'inputInfo';
      areaDisc.id = 'discr' + count;
      tdTitle22.appendChild(areaDisc);
      trTitle2.appendChild(tdTitle22);

  var trTitle3 = document.createElement("tr"); 
      trTitle3.style.borderBottom = '2px solid grey';
      trTitle3.style.padding = '7px 0';
      trTitle3.style.textAlign = 'center';
  var tdTitle3 = document.createElement("td");
  var span = document.createElement("span");
      span.style.opacity = 0;
   //   tdTitle3.colSpan = '2';
  var tdTitle33 = document.createElement("td");
  var inputLink = document.createElement("input");   
      inputLink.type = 'button';
      inputLink.id = 'link' + count;
      inputLink.className = 'class_control_button';
      inputLink.style.marginBottom = '15px';
      inputLink.value = 'Удалить блок';
      tdTitle3.appendChild(span);
      tdTitle33.appendChild(inputLink);
      trTitle3.appendChild(tdTitle3);
      trTitle3.appendChild(tdTitle33);      

  document.getElementById('table_flower_info').appendChild(trTitle);
  document.getElementById('table_flower_info').appendChild(trTitle2);
  document.getElementById('table_flower_info').appendChild(trTitle3);

}

//сохранить добавленные описания товара - нажали кнопку Сохранить описание 
async function updateItemFlowerInfo(){
let flowerId = document.getElementById('modal_flower_id_info').innerHTML;
let countRowTable = document.querySelectorAll('#table_flower_info > tr').length;
countRowTable = countRowTable/3;
let allInfo = new Array, allInfoNew = new Array, allInfoId = new Array;
let rowIndex = 1;
  for(var i = 0; i < countRowTable; i++)
  {
    allInfo[i]=({['flowerId'] : flowerId,
                ['title'] : document.querySelector('#table_flower_info > tr:nth-child('+[rowIndex]+') > td:nth-child(2) > input').value,
                ['discription'] : document.querySelector('#table_flower_info > tr:nth-child('+[rowIndex+1]+') > td:nth-child(2) > textarea').value,
    });
    allInfoId[i] = ({['id'] :document.querySelector('#table_flower_info > tr:nth-child('+[rowIndex+2]+') > td:nth-child(1) > span').innerHTML});
    rowIndex = rowIndex+3;
  }


  if(allInfo.length === 0)
    document.getElementById('mist7').innerHTML ='Нет описания товара';
  else
  {
    const localToken = localStorage.getItem('floweridaKey');

    fetch('/api/info/getAll',{
        method: "POST",
        headers: {"content-Type": "application/json", "Authorization": localToken},
        body: JSON.stringify({'flowerId':allInfo[0]['flowerId']})
        })
        .then((response) => response.json())
        .then(data =>{
           if(data.mes || data.message)
             document.getElementById('mist7').innerHTML = data.mes || data.message;

          console.log(allInfo.length);
           for(var i=0; i<allInfo.length; i++)
             {
            //  console.log(data.rows);
              let flag = 0;
              for(var j=0; j< data.rows.length; j++)
                {
                  if(data.rows[j]['id'] === parseInt(allInfoId[i]['id']))
                      {
                        flag=1;
                        fetch('/api/info/update',{
                              method: "POST",
                              headers: {"content-Type": "application/json", "Authorization": localToken},
                              body: JSON.stringify({'id':parseInt(allInfoId[i]['id']),'flowerId':allInfo[i]['flowerId'],'title':allInfo[i]['title'], 'discription':allInfo[i]['discription']})
                              })
                        .then((response) => response.json())
                        .then(data =>{
                                if(data.mes || data.message)
                                  document.getElementById('mist7').innerHTML = data.mes || data.message;
                                else{
                                    allInfoId[i]={['id']:0};
                                    console.log('заенил');   
                                    console.log(i, allInfoId);  
                                   }
                        });
                       }  
                }    
                if(flag === 0){
                    fetch('/api/info/create',{
                    method: "POST",
                    headers: {"content-Type": "application/json", "Authorization": localToken},
                    body: JSON.stringify({'flowerId':allInfo[i]['flowerId'], 'title':allInfo[i]['title'], 'discription':allInfo[i]['discription']})
                    })
                    .then((response) => response.json())
                    .then(data =>{
                      if(data.mes || data.message)
                        document.getElementById('mist7').innerHTML = data.mes || data.message;
                      else
                          closeItem('myModalDisc');
                    });   
                   }
                   else{
                    closeItem('myModalDisc');
                   }
                }
               });     
             }
     //   }
            /* for(var i=0; i<allInfoId.length; i++)
                {
                  if(allInfoId[i]['id'] != 0)
                  {
                    console.log('allInfoId[i]', allInfoId[i]['id']);
                    allInfoNew.push(allInfo[i]);
                  } 
                }*/
         // }
        //  console.log(allInfoNew, allInfoId);
         // if(allInfoNew.length > 0)
        //return allInfoNew;
       // });
      //  .then(data =>{
       //   console.log('data', data);
         /* for(var i=0; i<allInfoId.length; i++){
            if(allInfoId[i]['id'] != 0)
            {
              console.log('allInfoId[i]', allInfoId[i]['id']);
              allInfoNew.push(allInfo[i]);
            } 
          }*/
     /*     console.log(allInfoNew, allInfoId);
          if(allInfoNew.length > 0)
          {
        fetch('/api/info/create',{
                method: "POST",
                headers: {"content-Type": "application/json", "Authorization": localToken},
                body: JSON.stringify({'allInfo':allInfoNew})
                })
                .then((response) => response.json())
                .then(data =>{
                  if(data.mes || data.message)
                    document.getElementById('mist7').innerHTML = data.mes || data.message;
                  else
                      closeItem('myModalDisc');
                });   
          }     
        });*/
        

     }
  //}  

//сохранили форму с описанием
async function saveItemDisc(){}

async function delOneDiscriptionDB(event){
  const localToken = localStorage.getItem('floweridaKey');
  let targetId = event.target.id;
  let linkId = targetId.replace('link', '');
  linkId = parseInt(linkId);  
  let id = document.querySelector('#table_flower_info > tr:nth-child('+linkId +') > td:nth-child(1) > span').innerHTML;
 // let flowerId = document.getElementById('modal_flower_id_info').innerHTML;
 fetch('/api/info/delete',{
          method: "POST",
          headers: {"content-Type": "application/json", "Authorization": localToken},
          body: JSON.stringify({'id':id})//, 'flowerId':flowerId})
          })
          .then((response) => response.json())
          .then(data =>{
            if(data.mes || data.message)
              document.getElementById('mist7').innerHTML = data.mes || data.message;
            else 
                {
                  delOneDiscription(event);
                }
          });

}
/*-----------------*/
//нажали кнопку +добавить вид
/*
async function addNewVid()
{
  document.getElementById('myModalVid').style.display = 'block';
  document.getElementById('myModalVid').style.height = '400px';
  document.getElementById('Itd').style.display = 'none';
  //document.getElementById('control_div_table').style.display = 'block';
  document.getElementById('service_add').style.display = 'block';
    document.getElementById('pageView').style.display = 'block';

  document.getElementById('modal_new_vid').value = '';
   if(document.getElementById('control_modal_save_vid'))
      document.getElementById('control_modal_save_vid').remove;

  if(document.getElementById('control_modal_save_vid') === null)
    {
     let place = document.getElementById('control_modal_vid'); 
      var butSave = document.createElement("input");
          butSave.type = 'button';
          butSave.value = 'Сохранить';
          butSave.id = 'control_modal_save_vid';
          butSave.className = 'control_modal_close';
      place.appendChild(butSave);          
      document.getElementById('control_modal_save_vid').addEventListener('click', event => {addItemVid();})
    }
}*/

//нажали кнопку cохранить новый вид
/*
async function addItemVid(){
document.getElementById('control_modal_save_vid').remove;  
const localToken = localStorage.getItem('floweridaKey');
let name = document.getElementById('modal_new_vid').value;
if(!name)
  document.getElementById('mist5').innerHTML = 'Не заполнено поле вид!';
else{ 
  fetch('/api/vid/create',{
          method: "POST",
          headers: {"content-Type": "application/json", "Authorization": localToken},
          body: JSON.stringify({'name':name})
          })
          .then((response) => response.json())
          .then(data =>{
            if(data.mes || data.message)
              document.getElementById('mist5').innerHTML = data.mes || data.message;
            else 
                {
                correctVid();
                closeItem('myModalVid');
                }
          });
}
}*/

//нажали кнопку изменить вид
/*
async function vidChange(event){
  document.getElementById('myModalVid').style.display = 'block';
  document.getElementById('myModalVid').style.height = '400px';
  document.getElementById('Itd').style.display = 'block';

   if(document.getElementById('control_modal_save_vid1'))
      document.getElementById('control_modal_save_vid1').remove;

 let place = document.getElementById('control_modal_vid');
 if(document.getElementById('control_modal_save_vid1') === null)
 {
  var butSave = document.createElement("input");
      butSave.type = 'button';
      butSave.value = 'Сохранить';
      butSave.id = 'control_modal_save_vid1';
      butSave.className = 'control_modal_close';
  place.appendChild(butSave);          
  document.getElementById('control_modal_save_vid1').addEventListener('click', event => {changeItemVid();})
 }

  let trId = event.target.id;
  let trNum = trId.replace('butChange', '');
  trNum = parseInt(trNum) +1;
  console.log(trNum);
 // console.log(document.querySelector('#control_table > tr:nth-child('+trNum+') > td:nth-child(3)').innerHTML);
  document.getElementById('modal_vid_name').innerHTML = document.querySelector('#control_table > tr:nth-child('+trNum+') > td:nth-child(3)').innerHTML;
  document.getElementById('modal_new_vid').value = document.querySelector('#control_table > tr:nth-child('+trNum+') > td:nth-child(4)').innerHTML;

}*/
/*
async function changeItemVid(){
  const localToken = localStorage.getItem('floweridaKey');
  let id = document.getElementById('modal_vid_name').innerHTML;
  let name =  document.getElementById('modal_new_vid').value;

fetch('/api/vid/change',{
        method: "POST",
        headers: {"content-Type": "application/json", "Authorization": localToken},
        body: JSON.stringify({'id':id, 'name':name})
        })
        .then((response) => response.json())
        .then(data =>{
          if(data.change === 'ok')
          {
            document.getElementById('control_modal_save_vid1').remove;
             correctVid();
             closeItem('myModalVid');
          }  
          else{
            document.getElementById('mist5').innerHTML = data.mes || data.message;
          }   
        });

}*/
//нажали кнопку удалить вид
/*
async function vidDelete(event){
  const localToken = localStorage.getItem('floweridaKey');
  let trId = event.target.id;
  let trNum = trId.replace('delChange', '');
  trNum = parseInt(trNum) +1;  
  let id = document.querySelector('#control_table > tr:nth-child('+trNum+') > td:nth-child(3)').innerHTML;
//console.log('delID', id);
  fetch('/api/vid/delete',{
          method: "POST",
          headers: {"content-Type": "application/json", "Authorization": localToken},
          body: JSON.stringify({'id':id})
          })
          .then((response) => response.json())
          .then(data =>{
            if(data.mes || data.message)
              document.getElementById('mist5').innerHTML = data.mes || data.message;
            else 
                {
                correctVids();
                closeItem('myModalVid');
                }
          });
}*/




//нажали кнопку Пользователи - изменить
function showChange(event: Event): void {

// Меняем HTML-разметку внутри ЕДИНОГО окна под нужды сервиса пользователей
const contentTarget = document.getElementById('modalDynamicContent');
if (!contentTarget) return;

// Показываем подложку единого окна
const universalModal = document.getElementById('adminUniversalModal');
if (universalModal) {
    universalModal.style.display = 'flex'; // Используем flex для центрирования
    universalModal.style.height = 'auto'; // Окно само подстроится под контент
}

const target = event.target as HTMLInputElement;
let trId = target.id;
let trNum = trId.replace('butChange', '');
let rowIndex = trNum? parseInt(trNum) + 1 : 0;

//-------------------------------------------------
//-------------------------------------------------
if (currentMode === 'users') {
    const name = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(2)`)?.innerHTML || '';
    const email = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(3)`)?.innerHTML || '';
    const role = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(4)`)?.innerHTML || '';
    const status = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(5)`)?.innerHTML || '';

     // Закачиваем разметку полей в единое окно
    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
            <tr><td>Имя пользователя</td><td id="modal_user_name">${name}</td></tr>
            <tr><td>Email пользователя</td><td id="modal_user_email">${email}</td></tr>
            <tr><td>Role пользователя</td><td><input id="modal_user_role" type="text" value="${role}"></td></tr>
            <tr><td>Статус пользователя</td><td id="modal_user_status">${status}</td></tr>
        </table>
    `;
}
//-------------------------------------------------
//-------------------------------------------------
else if (currentMode === 'vids') {
   const id = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(2)`)?.innerHTML || '';
   const name = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(3)`)?.innerHTML || '';
 
     // Закачиваем разметку полей в единое окно
    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
            <tr><td>ID вида</td><td id="modal_vid_id">${id}</td></tr>
            <tr><td>Название вида</td><td id="modal_vid_name"><input type='text'>${name}</td></tr>
        </table>
    `;
}
else if (currentMode === 'flowers') {
  const idForm = document.getElementById('modal_flower_id') as HTMLInputElement || null;
  const nameForm = document.getElementById('modal_flower_name') as HTMLInputElement || null;
  const priceForm = document.getElementById('modal_flower_price') as HTMLInputElement || null;
  const mKeyWordsFrom = document.getElementById('modal_flower_key') as HTMLInputElement || null;
  const mDiscriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidIdFrom = document.getElementById('modal_flower_vid_id') as HTMLInputElement || null;
  const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;
  let id = idForm ? idForm.value : '';  
  let name = nameForm ? nameForm.value : '';
  let price = priceForm ? priceForm.value : '';
  let mKeyWords = mKeyWordsFrom ? mKeyWordsFrom.value : '';
  let mDiscript = mDiscriptFrom ? mDiscriptFrom.value : '';
  let vidId = vidIdFrom ? vidIdFrom.value : '';

     // Закачиваем разметку полей в единое окно
    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
          <tr id="Itd2"><td>ID</td><td id="modal_flower_id">${id}</td></tr>
          <tr><td>Вид</td><td><select id="modal_flower_vid_id">${vidId}</select></td></tr>
          <tr><td>Название</td><td ><input id="modal_flower_name" type="text" value="${name}"></td></tr>
          <tr><td>Цена</td><td><input id="modal_flower_price" type="text">${price}</td></tr>
          <tr><td>mKey</td><td><input id="modal_flower_key" type="text">${mKeyWords}<span class="textMeta">Значение key для метатега </span></td></tr>   
          <tr><td>mDiscription </td><td><input id="modal_flower_mDis" type="text">${mDiscript}<span class="textMeta">Значение discription для метатега </span> </td></tr>   
        </table>
    `;
}
else if (currentMode === 'flowersPhoto') {
  contentTarget.innerHTML = `
     <div id="uploadPhotoContainer" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
        <!-- Скрытый инпут для выбора файла, чтобы не портить внешний вид -->
        <input type="file" id="modalAddPhotoInput" accept="image/*" style="display: none;">
        
        <!-- Красивая кнопка, которая будет триггерить скрытый инпут -->
        <input type="button" id="modalAddPhotoBtn" class="class_control_button" value="⊕ Добавить фото" style="background-color: #4caf50; color: white;">
        
        <!-- Сюда будем выводить статус загрузки -->
        <span id="uploadStatus" style="font-size: 14px; color: #666;"></span>
      </div>
     <table id="myModalTableFlowerImg" style="padding-top: 25px; width: 100%;">
     </table>
  `;
}
else if (currentMode === 'flowersDiscription') {
  contentTarget.innerHTML = `
     <div id="uploadPhotoContainer" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
        
        <!-- Красивая кнопка, которая будет триггерить скрытый инпут -->
        <input type="button" id="modalAddDiscriptionBtn" class="class_control_button" value="⊕ Добавить описание" style="background-color: #4caf50; color: white;">
       
      </div>
     <table id="myModalTableFlowerDis" style="padding-top: 25px; width: 100%;">
     </table>
  `;
}
}

//нажали кнопку изменить Пользователь - модальное окно - Сохранить
function correctItem(): void {
const localToken = localStorage.getItem('floweridaKey');
// ==========================================
// ВАРИАНТ 1: Сохранение пользователя (Роли)
// ==========================================
if (currentMode === 'users') {
  const emailEl = document.getElementById('modal_user_email');
  const roleEl = document.getElementById('modal_user_role') as HTMLInputElement | null;

  if (!emailEl || !roleEl) return;

  fetch('/api/user/changeUser',{
        method: "PUT",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
        body: JSON.stringify({'email': emailEl.innerHTML, 'role':roleEl.value})
    })
    .then((response) => response.json())
    .then((data: ApiResponse<UserAttributes>) => {
        if(data.change === 'ok' || !data.mes)
        {
          correctUsers(currentPage);
          closeItem('adminUniversalModal'); 
        }  
        else{
        const mist4 = document.getElementById('modalMistake') as HTMLElement || null; // Ошибка выводится в общую область модалки
        if (mist4) mist4.innerHTML = data.mes || data.message || '';
        }   
    });
}
// ==========================================
// ВАРИАНТ 2: Сохранение / Добавление вида цветов
// ==========================================

if (currentMode === 'vids') {
  const idForm = document.getElementById('modal_vid_id') as HTMLElement || null;
  const nameForm =  document.getElementById('modal_vid_name') as HTMLInputElement || null;

  if (!idForm || !nameForm) return;

fetch('/api/vid/change',{
        method: "PUT",
        headers: {"content-Type": "application/json", "Authorization":  `Bearer ${localToken}`},
        body: JSON.stringify({'id':idForm.innerHTML, 'name':nameForm.value})
        })
        .then((response) => response.json())
        .then((data: ApiResponse<VidAttributes>) =>{
           if(data.change === 'ok' || !data.mes)
            {
            correctUsers(currentPage);
            closeItem('adminUniversalModal');
            }   
          else{
            const mist4 = document.getElementById('modalMistake') as HTMLElement || null; // Ошибка выводится в общую область модалки
            if (mist4) mist4.innerHTML = data.mes || data.message || '';
          }   
        });
}
// ==========================================
// ВАРИАНТ 3: Сохранение / Добавление цветка
// ==========================================
if (currentMode === 'flowers') {
  const localToken = localStorage.getItem('floweridaKey');
  const idForm = document.getElementById('modal_flower_id') as HTMLElement || null;
  const nameForm = document.getElementById('modal_flower_name') as HTMLInputElement || null;
  const priceForm = document.getElementById('modal_flower_price') as HTMLInputElement || null;
  const mKeyWordsFrom = document.getElementById('modal_flower_key') as HTMLInputElement || null;
  const mDiscriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidIdFrom = document.getElementById('modal_flower_vid_id') as HTMLInputElement || null;
  const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;

fetch('/api/flower/change',{
        method: "PUT",
        headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
        body: JSON.stringify({
          'id':idForm ? idForm.innerHTML : '', 
          'name':nameForm ? nameForm.value : '', 
          'price':priceForm ? priceForm.value : '', 
          'vidId':vidIdFrom ? vidIdFrom.value : '', 
          'mKeyWords':mKeyWordsFrom ? mKeyWordsFrom.value : '', 
          'mDiscript':mDiscriptFrom ? mDiscriptFrom.value : ''})
        })
        .then((response) => response.json())
        .then((data : ApiResponse<FlowerAttributes>) =>{
          if(data.change === 'ok')
          {
             correctFlowers(currentPage);
             closeItem('adminUniversalModal');
          }  
          else{
            if(mistakeForm) mistakeForm.innerHTML = String(data.mes || data.message);
          }   
        });  
}

}

function deleteItemUniversal(event: Event): void {
const localToken = localStorage.getItem('floweridaKey');
const target = event.target as HTMLInputElement;
 if(!target) return ;
//-------------------------------------------------------------
//-----Удаляем вид---------------------------------------------

if (currentMode === 'vids') {   
    const trId = target.id;
    const trNum0 = trId.replace('delChange', '');
    const trNum = Number(parseInt(trNum0) + 1);  

    const idSelector = document.querySelector(`#control_table > tr:nth-child(${trNum}) > td:nth-child(3)`) as HTMLElement || null;
    if (!idSelector) return;


    fetch(`/api/vid/delete/${idSelector.innerHTML}`,{
          method: "DELETE",
          headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
          })
          .then((response) => response.json())
          .then((data : ApiResponse<VidAttributes>) =>{
            if(data.mes || data.message){
              const mistake = document.getElementById('mist3') as HTMLElement || null;
              if(mistake) mistake.innerHTML = String(data.mes || data.message);
              return ;
            }
            correctVids(currentPage);                             
          });
}
//--------------------------------------------------------------
//--------------------------------------------------------------
if (currentMode === 'flowers') { 
   const trId = target.id;
   let trNum0 = trId.replace('butDelete', '');
   const trNum = Number(parseInt(trNum0) + 1);  
   const idForm = document.querySelector('#control_table > tr:nth-child('+trNum+') > td:nth-child(3)') as HTMLElement || null;
   if (!idForm) return;
   const id = idForm? idForm.innerHTML : '';
   
   fetch(`/api/flower/delete/${id}`,{
          method: "DELETE",
          headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
          })
          .then((response) => response.json())
          .then((data : ApiResponse<FlowerAttributes>) =>{
            if(data.mes || data.message){
              const mistake = document.getElementById('mist3') as HTMLElement || null;
              if(mistake) mistake.innerHTML = String(data.mes || data.message);
              return ;
            }
            correctFlowers(currentPage);    
          });
      }

if (currentMode === 'flowersPhoto') { 
   const trId = target.id;
   let trNum0 = trId.replace('delImg', '');
   const trNum = Number(parseInt(trNum0) - 1);  
   const idForm = document.querySelector('#myModalTableFlowerImg > #spanID('+ trNum+')') as HTMLElement || null;
   if (!idForm) return;
   const id = idForm? idForm.innerHTML : '';
   
   fetch(`/api/imgs/delete/${id}`,{
          method: "DELETE",
          headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
          })
          .then((response) => response.json())
          .then((data : ApiResponse<FlowerImgsAttributes>) =>{
            if(data.mes || data.message){
              const mistake = document.getElementById('mist3') as HTMLElement || null;
              if(mistake) mistake.innerHTML = String(data.mes || data.message);
              return ;
            }
            imgItemFlower(event);    
          });
      }      
}

async function addItemUniversal(event: Event): Promise<void>  {
// Меняем HTML-разметку внутри ЕДИНОГО окна под нужды сервиса пользователей
const contentTarget = document.getElementById('modalDynamicContent');
if (!contentTarget) return;

// Показываем подложку единого окна
const universalModal = document.getElementById('adminUniversalModal');
if (universalModal) {
    universalModal.style.display = 'flex'; // Используем flex для центрирования
    universalModal.style.height = 'auto'; // Окно само подстроится под контент
}

if (currentMode === 'vids') {
    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
            <tr><td>Название вида</td><td id="modal_vid_name"><input id="modal_new_vid" type="text"></td></tr>
        </table>
    `;
}

if (currentMode === 'flowers') {
    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
            <tr id="Itd2">
              <td>ID</td><td id="modal_flower_id">Новый</td>
            </tr>
            <tr>
              <td>Вид</td><td><select id="modal_flower_vid_id"><option value="">Загрузка видов...</option></select></td>
            </tr>
            <tr>
              <td>Название</td><td ><input id="modal_flower_name" type="text"></td>
            </tr>
            <tr>
              <td>Цена</td><td><input id="modal_flower_price" type="text"></td>
            </tr>
            <tr>
              <td>mKey</td><td><input id="modal_flower_key" type="text"><span class="textMeta">Значение key для метатега </span></td>
            </tr>   
            <tr>
              <td>mDiscription </td><td><input id="modal_flower_mDis" type="text"><span class="textMeta">Значение discription для метатега </span> </td>
            </tr>   
        </table>
    `;
    await populateVidsDropdown();
}

else if (currentMode === 'flowersPhoto') {

}

}
async function addItemSaveUniversal(){
const localToken = localStorage.getItem('floweridaKey');
const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;

if (currentMode === 'vids') {
  const nameForm = document.getElementById('modal_new_vid') as HTMLInputElement || null;

  let name = nameForm? nameForm.value : ''
  if(!name){
    if (mistakeForm) mistakeForm.innerHTML = 'Не заполнено поле вид!';
    return ;
  } 
  
    fetch('/api/vid/create',{
            method: "POST",
            headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
            body: JSON.stringify({'name': name})
            })
            .then((response) => response.json())
            .then((data : ApiResponse<VidAttributes>) =>{
              if(data.mes || data.message){
                if (mistakeForm) mistakeForm.innerHTML = data.mes || data.message || '';
                return ;
                }
              if (data.rows && data.rows.length > 0){
                  correctVids(currentPage);                  
                  closeItem('myModalVid');
                  }
            });
 
}
else if (currentMode === 'flowers') {
  const nameForm = document.getElementById('modal_flower_name') as HTMLInputElement || null;
  const priceForm = document.getElementById('modal_flower_price') as HTMLInputElement || null;
  const mKeyWordsFrom = document.getElementById('modal_flower_key') as HTMLInputElement || null;
  const mDiscriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidIdFrom = document.getElementById('modal_flower_vid_id') as HTMLInputElement || null;
  let name = nameForm ? nameForm.value : '';
  let price = priceForm ? priceForm.value : '';
  let mKeyWords = mKeyWordsFrom ? mKeyWordsFrom.value : '';
  let mDiscript = mDiscriptFrom ? mDiscriptFrom.value : '';
  let vidId = vidIdFrom ? vidIdFrom.value : '';

  if(!name || !vidId){
    if (mistakeForm) mistakeForm.innerHTML = 'Не заполнено поле Название или Вид!';
    return;
  }
    fetch('/api/flower/create',{
            method: "POST",
            headers: {"content-Type": "application/json", "Authorization":  `Bearer ${localToken}`},
            body: JSON.stringify({'name':name, 'price':price, 'vidId':vidId, 'mKeyWords':mKeyWords, 'mDiscript':mDiscript})
            })
            .then((response) => response.json())
            .then((data : ApiResponse<FlowerAttributes>) =>{
              if (data.mes || data.message) {
                if(mistakeForm) mistakeForm.innerHTML = String(data.mes || data.message);
                return ;
              }
              if (data.rows && data.rows.length > 0) {
                  correctFlowers(currentPage);                      
                  closeItem('myModalFlower');
                  }
            });
  }
}

//модальное окно - отмена
function closeItem(idModal: string): void {
    const modal = document.getElementById(idModal);
    if (modal) modal.style.display = 'none';
}
 

//************************ */
async function populateVidsDropdown(): Promise<void> {
    const selectElement = document.getElementById('modal_flower_vid_id') as HTMLSelectElement | null;
    if (!selectElement) return;

    try {
        // Делаем запрос к вашему API за всеми видами цветов
        const response = await fetch('/api/vid/getAll', {
            method: "GET",
            headers: { "content-Type": "application/json" }
        });
        
        const data: ApiResponse<VidAttributes> = await response.json();

        if (data.mes || data.message) {
            console.error('Ошибка бэкенда при загрузке видов:', data.mes || data.message);
            selectElement.innerHTML = '<option value="">Ошибка загрузки</option>';
            return;
        }

        if (data.rows && data.rows.length > 0) {
            // Очищаем селект от заглушки "Загрузка..." и добавляем дефолтный пустой вариант
            selectElement.innerHTML = '<option value="">-- Выберите вид цветка --</option>';

            // Пробегаемся по видам из БД и генерируем option
            data.rows.forEach((vid) => {
                const option = document.createElement('option');
                option.value = String(vid.id); // В value кладем ID вида для связи foreign key
                option.textContent = vid.name; // Пользователю показываем красивое название
                selectElement.appendChild(option);
            });
        } else {
            selectElement.innerHTML = '<option value="">Виды цветов не найдены</option>';
        }

    } catch (err) {
        console.error('Критическая ошибка сети при получении видов для селекта:', err);
        selectElement.innerHTML = '<option value="">Ошибка сети</option>';
    }
}