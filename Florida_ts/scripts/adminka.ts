import { ApiResponse, UserAttributes, VidAttributes, FlowerAttributes, FlowerImgsAttributes, FlowerInfoAttributes } from '../models/models';

// Глобальные переменные для пагинации и режимов админки
let currentMode: 'flowers' | 'vids' | 'flowersPhoto' | 'flowersDescription' | 'users' = 'users';
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
    document.getElementById('addNewItemFlower_but')?.addEventListener('click', (event : Event) => {addItemUniversal(event)}, false);    
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
            const headers = ['Удалить', 'Изменить', 'Название', 'Цена', 'Вид', 'Изображения', 'Описание', 'mKeyWords', 'mDescription'];
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
                document.getElementById(`butChangeDisc${num}`)?.addEventListener('click',  (event : Event) => {descItemFlower(event)}, false);

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

const target = event.target as HTMLElement | null;
    if (!target) return;

    const targetId = target.id;
    const linkIdChange = targetId.replace('butChangeImg', '');
    const flowerId = linkIdChange ? parseInt(linkIdChange) + 1 : 0;  

    // Навешиваем клик на кнопку добавления раздела (она уже есть в DOM после showChange)
    const btnAddPart = document.getElementById('modalAddPhotoPart') as HTMLInputElement | null;
    btnAddPart?.addEventListener('click', (e: Event) => { 
        addItemUniversal(e); 
        
    // Как только открылась форма добавления из addItemUniversal,
    // СРАЗУ подписываемся на появившиеся кнопки выбора и отправки файла!
    const btnAdd = document.getElementById('modalAddPhotoBtn') as HTMLInputElement | null;
    const fileInput = document.getElementById('modalAddPhotoInput') as HTMLInputElement | null;

    if (btnAdd) btnAdd.onclick = () => fileInput?.click();
    if (fileInput) {
        fileInput.onchange = (changeEvent: Event) => {
            addFileUniversal(changeEvent, flowerId, event);
        };
    }
    });

    const table = document.getElementById('myModalTableFlowerImg') as HTMLTableElement | null;
    if (table) {
        while (table.rows.length > 0) {
            table.deleteRow(0);
        }
    }

    const localToken = localStorage.getItem('floweridaKey');
    fetch(`/api/imgs/getAll/${flowerId}`, {
        method: "GET",
        headers: { "content-Type": "application/json", "Authorization": `Bearer ${localToken}` },
    })
    .then((response) => response.json())
    .then((data: ApiResponse<FlowerImgsAttributes>) => {
        if (data.mes || data.message) {
            const mistake = document.getElementById('modalMistake') as HTMLElement | null;
            if (mistake) mistake.innerHTML = String(data.mes || data.message);
            return;
        }
        
        if (table && data.rows) {
            data.rows.forEach((images, index) => {
                const numImg = index + 1;

                // СТРОКА 1: ID цветка
                const trId = document.createElement("tr");
                trId.className = 'newTr';
                trId.innerHTML = `
                    <td>ID описываемого цветка</td>
                    <td class="spanFlowerId">${flowerId}</td>
                `;
                table.appendChild(trId);

                // СТРОКА 2: Фото и скрытые метаданные
                const trPhoto = document.createElement("tr");
                trPhoto.className = 'newTr';
                trPhoto.innerHTML = `
                    <td>Фото</td>
                    <td>
                        <div><img id="img${numImg}" src="/imgStoreMINI/${images.img}" width="50" alt="flower"></div>
                        <span id="spanID${numImg}" style="display:none">${images.id || ''}</span>
                        <span id="spanName${numImg}" style="display:none">${images.img}</span>
                    </td>
                `;
                table.appendChild(trPhoto);

                // СТРОКА 3: Последовательность
                const trNum = document.createElement("tr");
                trNum.className = 'newTr';
                trNum.innerHTML = `
                    <td>Последовательность отображения</td>
                    <td class="spanFlowerNum" style="padding-bottom:25px">${images.num}</td>
                `;
                table.appendChild(trNum);

                // СТРОКА 4: Управление и удаление 
                const trControls = document.createElement("tr");
                trControls.className = 'newTr';
                trControls.style.borderBottom = '2px solid #ccc'; // Визуально отделяем карточки цветов друг от друга
                trControls.innerHTML = `
                    <td colspan="1"></td>
                    <td><input type="button" class="class_control_button" value="Удалить" id="delImg${numImg}" style="margin-bottom: 25px;"></td>
                `;
                table.appendChild(trControls);
                
                // Теперь ID ('delImg' + numImg) существует железно и без опечаток!
                document.getElementById('delImg' + numImg)?.addEventListener('click', (e: Event) => { 
                    delOneImgDB(e); 
                });
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
async function descItemFlower(event : Event): Promise<void> {
  currentMode = 'flowersDescription';
  showChange(event);

  const btnAdd = document.getElementById('modalAddDescriptionBtn') as HTMLInputElement | null;
  if (btnAdd) {
    btnAdd.onclick = (e: Event) => { addItemUniversal(e); };
  }

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
    if (flowerId === 0) {
        if (mistake) mistake.innerHTML = 'Не указан товар. Добавление описания товара невозможно!';
        return;
    }
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
                const trTitle = document.createElement("tr");
                trTitle.className = 'newTr';
                trTitle.innerHTML = `
                    <td>Название блока</td>
                    <td class="countBlocks"><input type="text" class="inputInfo" id="title${numInf}" value="${info.title}"></td>
                `;
                table.appendChild(trTitle);
                const trDescr  = document.createElement("tr");
                trDescr.className = 'newTr';
                trDescr.innerHTML = `
                    <td>Описание блока</td>
                    <td class="countBlocks"><textarea class="inputInfo" id="discr${numInf}" value="${info.description}"></textarea></td>
                `;
                table.appendChild(trDescr);
                const trControls   = document.createElement("tr");
                trControls .className = 'newTr';                
                trControls .innerHTML = `
                    <td><span class="flowerIdDiscr" style='opacity:0'>${flowerId}</span></td>
                    <td class="countBlocks"><input type="button" class="class_control_button" id="link${info.id}" value='Удалить блок' style="marginBottom:15px"></td>
                `;
                trControls .style.borderBottom = '2px solid grey';
                trControls .style.padding = '7px 0';
                trControls .style.textAlign = 'center';
                table.appendChild(trControls );
                                document.getElementById('link' + numInf)?.addEventListener('click', (e: Event) => { 
                    deleteItemUniversal(e); 
                });
            });  
            }     
        })
        .catch((error) => console.error('Ошибка загрузки описаний Flowerida:', error));
      
}

function delOneDescription(event){
  let targetId = event.target.id;
  let linkId = targetId.replace('link', '');
  linkId = parseInt(linkId); 
  const table = document.getElementById('table_flower_info');

for(var i=linkId; i>linkId-3; i--)
    table.removeChild(table.rows[linkId-3]);
  
}


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
          <tr><td>mDescription </td><td><input id="modal_flower_mDis" type="text">${mDescript}<span class="textMeta">Значение description для метатега </span> </td></tr>   
        </table>
    `;
}
else if (currentMode === 'flowersPhoto') {
  contentTarget.innerHTML = `
     <div id="uploadPhotoContainer" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
        
        <!-- Красивая кнопка, которая будет триггерить скрытый инпут -->
        <input type="button" id="modalAddPhotoPart" class="class_control_button" value="⊕ Добавить раздел с фото" style="background-color: #4caf50; color: white;">
      </div>
     <table id="myModalTableFlowerImg" style="padding-top: 25px; width: 100%;">
     </table>
  `;
}
else if (currentMode === 'flowersDescription') {
  contentTarget.innerHTML = `
     <div id="uploadDescrContainer" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
         <input type="button" id="modalAddDescriptionBtn" class="class_control_button" value="⊕ Добавить описание" style="background-color: #4caf50; color: white;">    
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
//-----Удаляем vids---------------------------------------------

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
//-----Удаляем flowers---------------------------------------------
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
//-----Удаляем flowersPhoto---------------------------------------------
if (currentMode === 'flowersPhoto') { 
   const trId = target.id;
   let trNum0 = trId.replace('delImg', '');
   const trNum = parseInt(trNum0);  
   const idPhoto = document.querySelector('#myModalTableFlowerImg > #spanID('+ trNum+')') as HTMLElement || null;
   if (!idPhoto) {

     return; 
   }
    
  
   const id = idPhoto? idPhoto.innerHTML : '';

   
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
      
//-----Удаляем flowersDescription---------------------------------------------    
if (currentMode === 'flowersDescription') { 
const targetId = target.id;
const infoIdFull = targetId.replace('link', '');
const infoId = parseInt(infoIdFull) || 0;  

 if(!infoId || infoId === 0){
   const table = document.getElementById('myModalTable') as HTMLTableElement || null;
   if(table) table.remove();
   return ;        
 }
   
 fetch(`/api/info/delete/${infoId}`,{
          method: "DELETE",
          headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
          })
          .then((response) => response.json())
          .then(data =>{
            if(data.mes || data.message){
              const mistake = document.getElementById('mist3') as HTMLElement || null;
              if(mistake) mistake.innerHTML = String(data.mes || data.message);
              return ;
            }
           descItemFlower(event);  
          });
}  
}

async function addItemUniversal(event: Event): Promise<void>  {
// Меняем HTML-разметку внутри ЕДИНОГО окна под нужды сервиса пользователей
const contentTarget = document.getElementById('modalDynamicContent');
if (!contentTarget) return;

const target = event.target as HTMLInputElement;
 if(!target) return ;

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
              <td>mDescription </td><td><input id="modal_flower_mDis" type="text"><span class="textMeta">Значение description для метатега </span> </td>
            </tr>   
        </table>
    `;
    await populateVidsDropdown();
}

else if (currentMode === 'flowersPhoto') {
 const flowerId = document.querySelectorAll('#myModalTableFlowerImg > .spanFlowerId') as NodeListOf<Element> || null;
 let flowerItem;
 if(flowerId && flowerId.length > 0) flowerItem = flowerId[0].innerHTML || '';
  contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">

           <tr>
              <td>ID описываемого цветка</td>
              <td class="spanFlowerId" id="flowerID_modal">${flowerId}</td>
           </tr>

           <tr>
            <td>
              <!-- Скрытый инпут для выбора файла, чтобы не портить внешний вид -->
              <input type="file" id="modalAddPhotoInput" accept="image/*" style="display: none;">
              
              <!-- Красивая кнопка, которая будет триггерить скрытый инпут -->
              <input type="button" id="modalAddPhotoBtn" class="class_control_button" value="Выбрать фото" style="background-color: #181d19; color: white;">
              </td>
              <td>
                <!-- Сюда будем выводить статус загрузки -->
                <span id="uploadStatus" style="font-size: 14px; color: #666;"></span>
              </td>
            </tr>

           <tr>            
            <td>Последовательность отображения</td>
            <td class="spanFlowerNum"><input type="text" id="modal_flower_num_img"></td> 
           </tr>

           <tr>
            <td collaps:collaps><input type="button" class="class_control_button" value="Удалить" id="modal_delImg"></td>
            <td style="padding-bottom:25px"></td>
           </tr> 
        </table>
    `;
}
else if (currentMode === 'flowersDescription') {
 const flowerId = document.querySelectorAll('#myModalTableFlowerDis > .flowerIdDiscr') as NodeListOf<Element> || null;
 let flowerItem;
 if(flowerId && flowerId.length > 0) flowerItem = flowerId[0].innerHTML || '';
  contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
                <tr>
                  <td>ID описываемого цветка</td><td class="id_flower_modal">${flowerItem}</td>
                </tr> 
                <tr>
                  <td>Название блока</td><td><input class="modal_title" type="text" class="inputInfo"></td>
                </tr> 
                <tr>
                  <td>Описание блока</td><td><textarea class="modal_discr" type="text" class="inputInfo"></textarea></td>
                </tr> 
                <tr style="border-bottom:'2px solid grey'; padding: '7px 0'; textAlign: 'center'">
                  <td><span style="opacity:0"></span></td>
                  <td class="countBlocks"><input type="button" class="class_control_button modal_link"></td>
                </tr> 
        </table>
    `;
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
else if (currentMode === 'flowersPhoto') {
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