import { ApiResponse, UserAttributes, VidAttributes, FlowerAttributes, FlowerImgsAttributes, FlowerInfoAttributes } from './types.js';
// Глобальные переменные для пагинации и режимов админки
let currentMode: 'flowers' | 'vids' | 'flowersPhoto' | 'flowersDescription' | 'users' = 'users';
let currentPage: number = 1;
const itemsPerPage: number = 9;
const modalViewItem = 'adminUniversalModal';

document.addEventListener('DOMContentLoaded', () => {
  const cancelBut = document.getElementById('control_modal_cancel');
if (cancelBut) {
    cancelBut.addEventListener('click', () => {
        closeItem(modalViewItem);
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


  const table = document.getElementById('control_table') as HTMLTableElement | null; 
        if (table) {
            while (table.rows.length > 0) {
                table.deleteRow(0);
            }
        }
 let buttonForAdd = document.getElementById('addNewItem_but') as HTMLButtonElement || null;
 if (!buttonForAdd) 
   {
    const butAdd = document.createElement("input");
          butAdd.type = 'button';
          butAdd.id = 'addNewItem_but';
          butAdd.style.background = 'none';
          butAdd.style.padding = '5px';
          butAdd.value = '⊕ Добавить товар(цветок)';
          table?.appendChild(butAdd);   
   }
 else{
    buttonForAdd.value = '⊕ Добавить товар(цветок)';
    }  
    document.getElementById('addNewItem_but')?.removeEventListener('click', (event : Event) => {addItemUniversal(event)}, false);    
    document.getElementById('addNewItem_but')?.addEventListener('click', (event : Event) => {addItemUniversal(event)}, false);    
   
 

 //const localToken = localStorage.getItem('floweridaKey');

  fetch(`/api/flower/getAll?page=${page}&limit=${itemsPerPage}`,{
        method: "GET",
        //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
        headers: {"content-Type": "application/json"}
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
            
            interface typeData{
                'id': number; 
                'name': string;
                'price'?: number;
                'vidTitle': string;
                'mKeyWords'?: string;
                'mDescript'?: string;
            };                             
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
                    <td>${flower.vidName || ''}</td>
                    <td><input type="button" class="class_control_button" value="⇓ Добавить фото" id="butChangeImg${num}"></td>
                    <td><input type="button" class="class_control_button" value="+ Добавить описание" id="butChangeDisc${num}"></td>
                    <td>${flower.mKeyWords || ''}</td>
                    <td>${flower.mDescript || ''}</td>
                `;
                table.appendChild(tr);
  
                const data : typeData = {
                    'id': flower.id, 
                    'name': flower.name,
                    'price': flower.price,
                    'vidTitle': flower.vidName || '',
                    'mKeyWords': flower.mKeyWords,
                    'mDescript': flower.mDescript
                };
                // Активация базовых кнопок строки
                document.getElementById(`butDelete${num}`)?.addEventListener('click', (e) => { deleteItemUniversal(e); });    
                document.getElementById(`butChange${num}`)?.addEventListener('click', (e) => { showChange(e, data); });    

                document.getElementById(`butChangeImg${num}`)?.addEventListener('click', (event : Event) => {imgItemFlower(event)}, false);   
                document.getElementById(`butChangeDisc${num}`)?.addEventListener('click',  (event : Event) => {descItemFlower(event)}, false);

            });   
                  
           const numPageInput = document.getElementById('numPage') as HTMLInputElement | null;
             if (numPageInput) numPageInput.value = String(page);
           } 
        }).catch((error)=> console.log(error));

}
//*********VID */
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


  const table = document.getElementById('control_table') as HTMLTableElement | null; 
  if (table) {
    while (table.rows.length > 0) { table.deleteRow(0); }}


let buttonForAdd = document.getElementById('addNewItem_but') as HTMLButtonElement || null;
 if (!buttonForAdd) 
   {
    const butAdd = document.createElement("input");
          butAdd.type = 'button';
          butAdd.id = 'addNewItem_but';
          butAdd.style.background = 'none';
          butAdd.style.padding = '5px';
          butAdd.value = '⊕ Добавить вид';
          table?.appendChild(butAdd);   
   }
 else{
    buttonForAdd.value = '⊕ Добавить вид';
    }  
    document.getElementById('addNewItem_but')?.removeEventListener('click', (event : Event) => {addItemUniversal(event)}, false);    
    document.getElementById('addNewItem_but')?.addEventListener('click', (event : Event) => {addItemUniversal(event)}, false);    
   
 

 // const localToken = localStorage.getItem('floweridaKey');
   
   fetch(`/api/vid/getAll?page=${page}&limit=${itemsPerPage}`,{
        method: "GET",
      //  headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
        headers: {"content-Type": "application/json"}
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
                    
            interface typeData{
                'id': number; 
                'name': string;
            };  
            data.rows.forEach((vid, index) => {
                const num = index + 1;
                const tr = document.createElement("tr");
                tr.className = 'newTr';

                tr.innerHTML = `
                    <td><input type="button" class="class_control_button" value="Удалить запись" id="delChange${vid.id}"></td>
                    <td><input type="button" class="class_control_button" value="Изменить запись" id="butChange${num}"></td>
                    <td>${vid.id}</td>
                    <td>${vid.name}</td>
                `;
                table.appendChild(tr);    
                const data : typeData = {'id': vid.id, 'name': vid.name};
                document.getElementById(`butChange${num}`)?.addEventListener('click', (e) => { showChange(e, data); });
                document.getElementById(`delChange${vid.id}`)?.addEventListener('click', (e) => { deleteItemUniversal(e); });            
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

//const localToken = localStorage.getItem('floweridaKey');
let buttonForAdd = document.getElementById('addNewItem_but') as HTMLButtonElement || null;
if(buttonForAdd) buttonForAdd.remove();

const table = document.getElementById('control_table') as HTMLTableElement | null; 
if (table) {
  while (table.rows.length > 0) {
       table.deleteRow(0);
     }
}

  fetch(`/api/user/allUsers?page=${page}&limit=${itemsPerPage}`,{
        method: "GET",
        //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
        headers: {"content-Type": "application/json"}        
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
            interface typeData {
                'name': string;
                'email': string;
                'role': string;
                'user_status': string;
            };
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
                const data : typeData={
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'user_status': user.user_status
                };
                // Навешивание обработчика изменений на каждую кнопку индивидуально
                document.getElementById(`butChange${num}`)?.addEventListener('click', (e) => { showChange(e,data); });            
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
showChange(event, null);

const target = event.target as HTMLElement | null;
    if (!target) return;

const linkIdChange = target.id.replace('butChangeImg', '');
    const rowIndex = linkIdChange ? parseInt(linkIdChange) + 1 : 0;
    const flowerIdSelector = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(3)`) as HTMLElement | null;
    const flowerId = flowerIdSelector ? parseInt(flowerIdSelector.innerHTML) : 0;

    // Скрытый маркер ID цветка для кнопки "Сохранить"
    const uploadContainer = document.getElementById('uploadPhotoContainer');
    if (uploadContainer) {
        uploadContainer.innerHTML = `
            <input type="button" id="modalAddPhotoPart" class="class_control_button" value="⊕ Добавить поле для фото" style="background-color: #4caf50; color: white;">
            <span id="modal_flower_id_hidden" style="display:none">${flowerId}</span>
        `;
    }

   const table = document.getElementById('myModalTableFlowerImg') as HTMLTableElement | null;
    if (table) table.innerHTML = '';



    const localToken = localStorage.getItem('floweridaKey');
    fetch(`/api/imgs/getAll/${flowerId}`, {
        method: "GET",
//        headers: { "content-Type": "application/json", "Authorization": `Bearer ${localToken}` },
     headers: { "content-Type": "application/json" },
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
                const rowGroup = document.createElement("tbody");
                rowGroup.className = 'image-row existing-image';
                rowGroup.setAttribute('data-id', String(images.id)); // Маркер старой картинки

                rowGroup.innerHTML = `
                    <tr><td>ID цветка</td><td class="spanFlowerId">${flowerId}</td></tr>
                    <tr>
                        <td>Фото</td>
                        <td>
                            <div><img src="/imgStoreMINI/${images.img}" width="50"></div>
                            <span class="spanName">${images.img}</span>
                        </td>
                    </tr>
                    <tr><td>Порядок</td><td><input class="spanFlowerNum" type="text" value="${images.num}"></td></tr>
                    <tr><td></td><td><input type="button" class="class_control_button call-delete" value="Удалить" id="delImg${numImg}"></td></tr>
                `;
                table.appendChild(rowGroup);
                document.getElementById(`delImg${numImg}`)?.addEventListener('click', (e) => delOneImgDB(e));
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
          //  headers: { "Authorization": `Bearer ${localToken}` },
            body: formData
        });

        const imageName = await uploadResponse.text();

        // Шаг 2: Создаем запись связи картинки и цветка в базе данных
        const dbResponse = await fetch('/api/imgs/create', {
            method: "POST",
            headers: { 
                "content-Type": "application/json", 
             //   "Authorization": `Bearer ${localToken}` 
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
async function delOneImgDB(event :Event): Promise<void> {
const localToken = localStorage.getItem('floweridaKey');
const target = event.target as HTMLElement | null;;
if(!target) 
    return ;
  const targetId = String(target.id);
  const linkIdFull = targetId.replace('delImg', '');
  const linkId = parseInt(linkIdFull);  
  
  const idEl = document.getElementById('spanID' +linkId) as HTMLElement || null;
  const nameEl = document.getElementById('spanName' +linkId) as HTMLElement || null;
  const id = idEl? idEl.innerHTML : 0;
  const name = nameEl? nameEl.innerHTML : '';



 fetch(`/api/imgs/delete/${id}` ,{
          method: "DELETE",
     //     headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
          headers: {"content-Type": "application/json"},          
          body: JSON.stringify({'id': id})
          })
          .then((response) => response.json())
          .then(data =>{
            if (data.mes || data.message) {
                const mistake = document.getElementById('modalMistake') as HTMLElement | null;
                if (mistake) mistake.innerHTML = String(data.mes || data.message);
                return;
            }
          });
}

//Нажали Добавить-описание товара
async function descItemFlower(event: Event): Promise<void> {
    currentMode = 'flowersDescription';
    showChange(event, null);

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Вычисляем flowerId из строки таблицы товаров
    const trId = target.id;
    const trNumChange = trId.replace('butChangeDisc', '');
    const rowIndex = trNumChange ? parseInt(trNumChange) + 1 : 0;
    const flowerIdSelector = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(3)`) as HTMLElement | null;
    const flowerId = flowerIdSelector ? parseInt(flowerIdSelector.innerHTML) : 0;

    // Прячем ID цветка в шапку модалки для последующего группового сохранения
    const container = document.getElementById('uploadDescrContainer');
    if (container) {
        container.innerHTML = `
            <input type="button" id="modalAddDescriptionBtn" class="class_control_button" value="⊕ Добавить описание" style="background-color: #4caf50; color: white;">
            <span id="modal_flower_id_hidden" style="display:none">${flowerId}</span>
        `;
    }

    // Обработчик кнопки «Добавить описание» — просто рендерит пустые инпуты локально
    document.getElementById('modalAddDescriptionBtn')?.addEventListener('click', () => {
        const table = document.getElementById('myModalTableFlowerDis') as HTMLTableElement | null;
        if (!table) return;
        const curLength = table.querySelectorAll('.descr-row').length;

        const rowGroup = document.createElement("tbody");
        rowGroup.className = 'descr-row'; // Класс-маркер для сбора данных, БЕЗ data-id
        rowGroup.id = `descrRowLocal_${curLength}`;

        rowGroup.innerHTML = `
            <tr><td>Название блока</td><td><input type="text" class="inputInfoTitle" value=""></td></tr>
            <tr><td>Описание блока</td><td><textarea class="inputInfoText"></textarea></td></tr>
            <tr style="border-bottom: 2px solid grey;">
                <td><span class="flowerIdDiscr" style='opacity:0'>${flowerId}</span></td>
                <td><input type="button" class="class_control_button" id="linkLocal_${curLength}" value='Удалить форму' style="margin-bottom:15px"></td>
            </tr>
        `;
        table.appendChild(rowGroup);
        // Локальное удаление формы (так как в БД записи еще нет)
        document.getElementById(`linkLocal_${curLength}`)?.addEventListener('click', () => rowGroup.remove());
    });

    const table = document.getElementById('myModalTableFlowerDis') as HTMLTableElement | null;
    if (table) table.innerHTML = '';

    const localToken = localStorage.getItem('floweridaKey');
    
    // Загружаем сохраненные данные из бэкенда
    fetch(`/api/info/getAll/${flowerId}`, {
        method: "GET",
//        headers: { "content-Type": "application/json", "Authorization": `Bearer ${localToken}` }
        headers: { "content-Type": "application/json" }        
    })
    .then((response) => response.json())
    .then((data: ApiResponse<FlowerInfoAttributes>) => {
        if (data.rows && table) {
            data.rows.forEach((info) => {
                const rowGroup = document.createElement("tbody");
                rowGroup.className = 'descr-row';
                rowGroup.setAttribute('data-id', String(info.id)); // Маркер существующей записи

                rowGroup.innerHTML = `
                    <tr>
                        <td>Название блока</td>
                        <td><input type="text" class="inputInfoTitle" value="${info.title}"></td>
                    </tr>
                    <tr>
                        <td>Описание блока</td>
                        <td><textarea class="inputInfoText">${info.description}</textarea></td>
                    </tr>
                    <tr style="border-bottom: 2px solid grey;">
                        <td><span class="flowerIdDiscr" style='opacity:0'>${flowerId}</span></td>
                        <td><input type="button" class="class_control_button" id="linkServer_${info.id}" value='Удалить блок' style="margin-bottom:15px"></td>
                    </tr>
                `;
                table.appendChild(rowGroup);
                
                // Мгновенное удаление старой записи из БД
                document.getElementById(`linkServer_${info.id}`)?.addEventListener('click', (e: Event) => {
                    deleteItemUniversal(e);
                });
            });
        }
    })
    .catch((error) => console.error('Ошибка загрузки описаний:', error));
}

//нажали кнопку Пользователи - изменить
function showChange(event: Event, dataVal): void {

// Меняем HTML-разметку внутри ЕДИНОГО окна под нужды сервиса пользователей
const contentTarget = document.getElementById('modalDynamicContent');
if (!contentTarget) return;

// Показываем подложку единого окна
const universalModal = document.getElementById(modalViewItem);
if (universalModal) {
    universalModal.style.display = 'flex'; // Используем flex для центрирования
    universalModal.style.height = 'auto'; // Окно само подстроится под контент
}

const target = event.target as HTMLInputElement;
let trId = target.id;
let trNum = trId.replace('butChange', '');
let rowIndex = trNum? parseInt(trNum) : 0;

//-------------------------------------------------
//-------------------------------------------------
if (currentMode === 'users') {
 /*   const name = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(2)`)?.innerHTML || '';
    const email = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(3)`)?.innerHTML || '';
    const role = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(4)`)?.innerHTML || '';
    const status = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(5)`)?.innerHTML || '';
*/
     // Закачиваем разметку полей в единое окно
    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
            <tr><td>Имя пользователя</td><td id="modal_user_name">${dataVal.name}</td></tr>
            <tr><td>Email пользователя</td><td id="modal_user_email">${dataVal.email}</td></tr>
            <tr><td>Role пользователя</td><td><input id="modal_user_role" type="text" value="${dataVal.role}"></td></tr>
            <tr><td>Статус пользователя</td><td id="modal_user_status">${dataVal.user_status}</td></tr>
        </table>
    `;
}
//-------------------------------------------------
//-------------------------------------------------
else if (currentMode === 'vids') {

     // Закачиваем разметку полей в единое окно
    contentTarget.innerHTML = `
        <table id="myModalTable" style="margin-top: 25px; width: 100%;">
            <tr><td>ID вида</td><td id="modal_vid_id">${dataVal.id}</td></tr>
            <tr><td>Название вида</td><td><input type='text' id="modal_vid_name" value="${dataVal.name}"></td></tr>
        </table>
    `;
}
else if (currentMode === 'flowers') {
  const idForm = document.getElementById('modal_flower_id') as HTMLInputElement || null;
  const nameForm = document.getElementById('modal_flower_name') as HTMLInputElement || null;
  const priceForm = document.getElementById('modal_flower_price') as HTMLInputElement || null;
  const mKeyWordsFrom = document.getElementById('modal_flower_key') as HTMLInputElement || null;
  const mDescriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidIdFrom = document.getElementById('modal_flower_vid_id') as HTMLInputElement || null;
  const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;
  let id = idForm ? idForm.value : '';  
  let name = nameForm ? nameForm.value : '';
  let price = priceForm ? priceForm.value : '';
  let mKeyWords = mKeyWordsFrom ? mKeyWordsFrom.value : '';
  let mDescript = mDescriptFrom ? mDescriptFrom.value : '';
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
//const localToken = localStorage.getItem('floweridaKey');
// ==========================================
// ВАРИАНТ 1: Сохранение пользователя (Роли)
// ==========================================
if (currentMode === 'users') {
  const emailEl = document.getElementById('modal_user_email');
  const roleEl = document.getElementById('modal_user_role') as HTMLInputElement | null;

  if (!emailEl || !roleEl) return;

  fetch('/api/user/changeUser',{
        method: "PUT",
        //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
        headers: {"content-Type": "application/json"},        
        body: JSON.stringify({'email': emailEl.innerHTML, 'role':roleEl.value})
    })
    .then((response) => response.json())
    .then((data: ApiResponse<UserAttributes>) => {
        if(data.change === 'ok' || !data.mes)
        {
          correctUsers(currentPage);
          closeItem(modalViewItem); 
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
         headers: {"content-Type": "application/json"},
       // headers: {"content-Type": "application/json", "Authorization":  `Bearer ${localToken}`},
        body: JSON.stringify({'id':idForm.innerHTML, 'name':nameForm.value})
        })
        .then((response) => response.json())
        .then((data: ApiResponse<VidAttributes>) =>{
           if(data.change === 'ok' || !data.mes)
            {
            correctVids(currentPage);
            closeItem(modalViewItem);
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
  const mDescriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidIdFrom = document.getElementById('modal_flower_vid_id') as HTMLSelectElement || null;
  const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;
/* const selectedText : string='';
  if (vidIdFrom && vidIdFrom.selectedIndex !== -1) {
    const selectedOption = vidIdFrom.options[vidIdFrom.selectedIndex]; 
    const selectedText = selectedOption.text; 
}*/

fetch('/api/flower/change',{
        method: "PUT",
        //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
        headers: {"content-Type": "application/json"},
        body: JSON.stringify({
          'id':idForm ? idForm.innerHTML : '', 
          'name':nameForm ? nameForm.value : '', 
          'price':priceForm ? priceForm.value : '', 
          'vidId':vidIdFrom ? vidIdFrom.value : '', 
          'mKeyWords':mKeyWordsFrom ? mKeyWordsFrom.value : '', 
          'mDescript':mDescriptFrom ? mDescriptFrom.value : ''})
        })
        .then((response) => response.json())
        .then((data : ApiResponse<FlowerAttributes>) =>{
          if(data.change === 'ok')
          {
             correctFlowers(currentPage);
             closeItem(modalViewItem);
          }  
          else{
            if(mistakeForm) mistakeForm.innerHTML = String(data.mes || data.message);
          }   
        });  
}
// ==========================================
// ВАРИАНТ 4: Сохранение / Добавление фото
// ==========================================
if (currentMode === 'flowersPhoto'){
    const localToken = localStorage.getItem('floweridaKey');
    const flowerIdEl = document.getElementById('modal_flower_id_hidden');
    const flowerId = flowerIdEl ? flowerIdEl.innerHTML : '';
    
    const formData = new FormData();
    formData.append('flowerId', flowerId);

    // 1. Собираем старые картинки (меняем им только num)
    const existingImages: { id: number, num: number }[] = [];
    document.querySelectorAll('#myModalTableFlowerImg .existing-image').forEach((row) => {
        const id = row.getAttribute('data-id');
        const numInput = row.querySelector('.spanFlowerNum') as HTMLInputElement | null;
        if (id && numInput) {
            existingImages.push({ id: parseInt(id), num: parseInt(numInput.value) || 0 });
        }
    });
    formData.append('existingImages', JSON.stringify(existingImages));

    // 2. Собираем новые картинки (файлы + их желаемый num)
    const newImagesNum: number[] = [];
    document.querySelectorAll('#myModalTableFlowerImg .new-image-row').forEach((row) => {
        const fileInput = row.querySelector('.newImgInput') as HTMLInputElement | null;
        const numInput = row.querySelector('.spanFlowerNum') as HTMLInputElement | null;
        
        if (fileInput && fileInput.files && fileInput.files[0] && numInput) {
            formData.append('newFiles', fileInput.files[0]); // Добавляем файл в FileList
            newImagesNum.push(parseInt(numInput.value) || 0);
        }
    });
    formData.append('newImagesNum', JSON.stringify(newImagesNum));

    // Отправляем всё ОДНИМ групповым PUT-запросом
    fetch('/api/imgs/saveGalleryGroup', {
        method: "PUT",
     //   headers: { "Authorization": `Bearer ${localToken}` }, // Content-Type браузер выставит сам как multipart/form-data
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.change === 'ok') {
            closeItem(modalViewItem);
            correctFlowers(currentPage);
        }
    });
}
// ==========================================
// ВАРИАНТ 4: Сохранение / Добавление описания
// ==========================================
if (currentMode === 'flowersDescription') {
    const localToken = localStorage.getItem('floweridaKey');
    const flowerIdEl = document.getElementById('modal_flower_id_hidden');
    const flowerId = flowerIdEl ? parseInt(flowerIdEl.innerHTML) : 0;
    const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;

    const descrRows = document.querySelectorAll('#myModalTableFlowerDis .descr-row');
    const descriptionsData: { id?: number, title: string, description: string }[] = [];

    descrRows.forEach((row) => {
        const id = row.getAttribute('data-id');
        const titleInput = row.querySelector('.inputInfoTitle') as HTMLInputElement | null;
        const textInput = row.querySelector('.inputInfoText') as HTMLTextAreaElement | null;

        if (titleInput && textInput) {
            descriptionsData.push({
                id: id ? parseInt(id) : undefined, // Для новых строк id будет undefined
                title: titleInput.value,
                description: textInput.value
            });
        }
    });

    fetch('/api/info/updateBlocks', {
        method: "PUT",
        //headers: { "content-Type": "application/json", "Authorization": `Bearer ${localToken}` },
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({ flowerId, descriptions: descriptionsData })
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.change === 'ok') {
            closeItem(modalViewItem);
            correctFlowers(currentPage); // Обновляем основную таблицу
        } else if (mistakeForm) {
            mistakeForm.innerHTML = data.mes || data.message || 'Ошибка при сохранении описаний';
        }
    });
}
}

/*=================================================*/
/*DELETE*currentMode***vids**flowers**flowersPhoto**flowersDescription**/
/*=================================================*/
function deleteItemUniversal(event: Event): void {
//const localToken = localStorage.getItem('floweridaKey');
const target = event.target as HTMLInputElement;
 if(!target) return ;
//-------------------------------------------------------------
//-----Удаляем vids---------------------------------------------

if (currentMode === 'vids') {   
    const trId = target.id;
    const trNum0 = trId.replace('delChange', '');
    const trNum = Number(parseInt(trNum0));  

    if (!trNum) return;
    console.log(trNum);
    fetch(`/api/vid/delete/${trNum}`,{
          method: "DELETE",
          //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
          headers: {"content-Type": "application/json"}
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
          //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
          headers: {"content-Type": "application/json"}
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
          //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`}
          headers: {"content-Type": "application/json"}
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
    const infoIdFull = targetId.replace('linkServer_', '');
    const infoId = parseInt(infoIdFull) || 0;  

    if (infoId === 0) return;
       
    fetch(`/api/info/delete/${infoId}`, {
        method: "DELETE",
        //headers: { "content-Type": "application/json", "Authorization": `Bearer ${localToken}` }
        headers: { "content-Type": "application/json" }
    })
    .then((response) => response.json())
    .then(data => {
        if (data.change === 'ok') {
            // Заставляем модалку перерисоваться актуальными данными из БД
            descItemFlower(event);  
        } else {
            const mistake = document.getElementById('modalMistake');
            if (mistake) mistake.innerHTML = data.mes || data.message || 'Ошибка удаления';
        }
    });        

 fetch(`/api/info/delete/${infoId}`,{
          method: "DELETE",
          //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
          headers: {"content-Type": "application/json"},
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

/*=================================================*/
/*ONLY FORMS *currentMode***vids**flowers**flowersPhoto**/
/*=================================================*/
async function addItemUniversal(event: Event): Promise<void>  {
// Меняем HTML-разметку внутри ЕДИНОГО окна под нужды сервиса пользователей
const contentTarget = document.getElementById('modalDynamicContent');
if (!contentTarget) return;

const target = event.target as HTMLInputElement;
 if(!target) return ;

// Показываем подложку единого окна
const universalModal = document.getElementById(modalViewItem);

if (universalModal) {
    universalModal.style.display = 'flex'; // Используем flex для центрирования
    universalModal.style.height = 'auto'; // Окно само подстроится под контент
}
//----------Добавление нового вида
if (currentMode === 'vids') {
    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
            <tr><td>Название вида</td><td><input id="modal_vid_name" type="text"></td></tr>
        </table>
    `;
}
//----------Добавление нового цветка
if (currentMode === 'flowers') {
contentTarget.innerHTML = `
    <table id="myModalTable" style="margin-top: 25px; width: 100%;">
      <tr id="Itd2"><td>ID</td><td id="modal_flower_id"></td></tr>
      
      <!-- Изменено: текстовое поле с привязкой к datalist -->
      <tr>
        <td>Вид</td>
        <td>
            <input id="modal_flower_vid_input" type="text" list="vids_list" placeholder="Начните вводить вид...">
            <datalist id="vids_list"></datalist>
        </td>
      </tr>
      
      <tr><td>Название</td><td><input id="modal_flower_name" type="text"></td></tr>
      <!-- Исправлено: значение вставляется внутрь атрибута value, чтобы инпут не был пустым -->
      <tr><td>Цена</td><td><input id="modal_flower_price" type="text"></td></tr>
      <tr><td>mKey</td><td><input id="modal_flower_key" type="text"><span class="textMeta">Значение key для метатега </span></td></tr>   
      <tr><td>mDescription</td><td><input id="modal_flower_mDis" type="text"><span class="textMeta">Значение description для метатега </span></td></tr>   
    </table>
`;
    await populateVidsDropdown();
}
//----------Добавление нового изображения
else if (currentMode === 'flowersPhoto') {

 const contentTargetPh = document.getElementById('myModalTableFlowerImg');
 if (!contentTargetPh) return;

 const flowerId = document.querySelectorAll('#myModalTableFlowerImg > .spanFlowerId') as NodeListOf<Element> || null;
 const curTableLength = flowerId?.length || 0
 
 let flowerIDItem : string = '';
 if(flowerId && flowerId.length > 0) flowerIDItem = String(flowerId[0].innerHTML || '');
const htmlBlock = `
    <tbody class="image-row new-image-row">
       <tr><td>ID цветка</td><td class="spanFlowerId">${flowerIDItem}</td></tr>
       <tr>
        <td>Выберите файл</td>
        <td>
          <input class="newImgInput" type="file" accept="image/*">
        </td>
       </tr>
       <tr><td>Порядок</td><td><input type="text" class="spanFlowerNum" value="${curTableLength + 1}"></td></tr>
       <tr><td></td><td><input type="button" class="class_control_button remove-local-row" id="modalDelImg${curTableLength+1} value="Удалить форму"></td></tr>
    </tbody>
`;
contentTargetPh.insertAdjacentHTML('beforeend', htmlBlock);

    document.getElementById(`modalDelImg${curTableLength + 1}`)?.addEventListener('click', (e: Event) => { 
         deleteItemUniversal(e);
         const tableDel = document.getElementById(`modalTable${curTableLength}`) as HTMLTableElement || null;
         if(tableDel) tableDel.remove();
    });
     // Как только открылась форма добавления из addItemUniversal,
    // СРАЗУ подписываемся на появившиеся кнопки выбора и отправки файла!
    const btnAdd = document.getElementById(`modalAddPhotoBtn${curTableLength}`) as HTMLInputElement | null;
    const fileInput = document.getElementById(`modalAddPhotoInput${curTableLength}`) as HTMLInputElement | null;

    if (btnAdd) btnAdd.onclick = () => fileInput?.click();
    if (fileInput) {
        fileInput.onchange = (changeEvent: Event) => {
            addFileUniversal(changeEvent, Number(flowerIDItem || 0), event);
        };
    }
}
//----------Добавление нового описания
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
                  <td>Описание блока</td><td><textarea class="modal_descr" type="text" class="inputInfo"></textarea></td>
                </tr> 
                <tr style="border-bottom:'2px solid grey'; padding: '7px 0'; textAlign: 'center'">
                  <td><span style="opacity:0"></span></td>
                  <td class="countBlocks"><input type="button" class="class_control_button modal_link"></td>
                </tr> 
        </table>
    `;
    }
}

/*=================================================*/
/*CREATE*currentMode***vids**flowers**flowersPhoto**/
/*=================================================*/

async function addItemSaveUniversal(){
//const localToken = localStorage.getItem('floweridaKey');
const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;

if (currentMode === 'vids') {
  const nameForm = document.getElementById('modal_vid_name') as HTMLInputElement || null;

  let name = nameForm? nameForm.value : ''
  if(!name){
    if (mistakeForm) mistakeForm.innerHTML = 'Не заполнено поле вид!';
    return ;
  } 
  
    fetch('/api/vid/create',{
            method: "POST",
            //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
            headers: {"content-Type": "application/json"},
            body: JSON.stringify({'name': name})
            })
            .then((response) => response.json())
            .then((data : ApiResponse<VidAttributes>) =>{
              if(data.mes || data.message){
                    if (mistakeForm) mistakeForm.innerHTML = data.mes || data.message || '';
                    return ;
                }
                correctVids(currentPage);              
                closeItem(modalViewItem);
            });
 
}
else if (currentMode === 'flowers') {
  const nameForm = document.getElementById('modal_flower_name') as HTMLInputElement || null;
  const priceForm = document.getElementById('modal_flower_price') as HTMLInputElement || null;
  const mKeyWordsFrom = document.getElementById('modal_flower_key') as HTMLInputElement || null;
  const mDescriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidIdFrom = document.getElementById('modal_flower_vid_input') as HTMLInputElement || null;
  let name = nameForm ? nameForm.value : '';
  let price = priceForm ? priceForm.value : '';
  let mKeyWords = mKeyWordsFrom ? mKeyWordsFrom.value : '';
  let mDescript = mDescriptFrom ? mDescriptFrom.value : '';
  let vidName = vidIdFrom ? vidIdFrom.value : '';

  if(!name || !vidName){
    if (mistakeForm) mistakeForm.innerHTML = 'Не заполнено поле Название или Вид!';
    return;
  }
    fetch('/api/flower/create',{
            method: "POST",
            //headers: {"content-Type": "application/json", "Authorization":  `Bearer ${localToken}`},
            headers: {"content-Type": "application/json"},
            body: JSON.stringify({'name':name, 'price':price, 'vidName':vidName, 'mKeyWords':mKeyWords, 'mDescript':mDescript})
            })
            .then((response) => response.json())
            .then((data : ApiResponse<FlowerAttributes>) =>{
              if (data.mes || data.message) {
                if(mistakeForm) mistakeForm.innerHTML = String(data.mes || data.message);
                return ;
              }
              if (data.rows && data.rows.length > 0) {
                  correctFlowers(currentPage);                      
                  closeItem(modalViewItem);
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
            //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
            headers: {"content-Type": "application/json"},
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
                  closeItem(modalViewItem);
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
        const datalist = document.getElementById('vids_list') as HTMLDataListElement | null;
        if (data.mes || data.message) {
            console.error('Ошибка бэкенда при загрузке видов:', data.mes || data.message);
            selectElement.innerHTML = '<option value="">Ошибка загрузки</option>';
            return;
        }

        if (datalist && data.rows && data.rows.length > 0) {
            datalist.innerHTML = '';
            // Очищаем селект от заглушки "Загрузка..." и добавляем дефолтный пустой вариант

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