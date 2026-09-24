import { ApiResponse, UserAttributes, VidAttributes, FlowerAttributes, FlowerImgsAttributes, FlowerInfoAttributes } from './types.js';
import { moduleWebPartUser } from '../src/partishional.js';
// Глобальные переменные для пагинации и режимов админки
let currentMode: 'flowers' | 'vids' | 'flowersPhoto' | 'flowersDescription' | 'users' = 'users';
let currentPage: number = 1;
let totalPages: number = 1;
const itemsPerPage: number = 9;
const modalViewItem = 'adminUniversalModal';
const moduleWebPart  = new  moduleWebPartUser();

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
        const discIdEl = document.getElementById('modalDynamicContent');
        const imgsEl = document.getElementById('uploadPhotoContainer');
        
        
        // Если в форме есть ID и это не текст "Автоинкремент" — значит, это РЕДАКТИРОВАНИЕ
        const isEditFlower = flowerIdEl && flowerIdEl.innerHTML !== 'Автоинкремент' && flowerIdEl.innerHTML !== '';
        const isEditVid = vidIdEl && vidIdEl.innerHTML !== '';
        const isEditUser = (currentMode === 'users');

        if (isEditFlower || isEditVid || isEditUser) {
            console.log('save');
            correctItem(); // Вызываем сохранение изменений
        } 
        else if(discIdEl){
            correctItem();
        }
        else if(imgsEl){
            saveWholeGallery();
        }        
        else {
            console.log('create');
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
                updatePaginationInterface();
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
            updatePaginationInterface();
            if (currentMode === 'users') correctUsers(currentPage);
            else if (currentMode === 'flowers') correctFlowers(currentPage);
            else if (currentMode === 'vids') correctVids(currentPage);            
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
        .then((data : ApiResponse & FlowerAttributes) =>{
           if(data.mes || data.message){
            const mistake = document.getElementById('mist3') as HTMLElement || null
            if(mistake) mistake.innerHTML = String(data.mes || data.message);
            return ;
           }
           totalPages = data.pages || 1
           if (table && data.rows) {
              console.log(data);
              var trHead = document.createElement("tr");
                  trHead.className = 'newTr'

              //добавили заголовки
            const headers = ['Удалить', 'Изменить', 'Название', 'Цена', 'Статус', 'Вид', 'Изображения', 'Описание', 'mKeyWords', 'mDescription'];
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
                'status'?: string;
                'vidTitle': string;
                'mKeyWords'?: string;
                'mDescript'?: string;
            };                             
            data.rows.forEach((flower, index) => {
                const num = index + 1;
                const tr = document.createElement("tr");
                tr.className = 'newTr';

                tr.innerHTML = `
                    <td><input type="button" class="class_control_button" value="Удалить запись" id="butDelete${flower.id}"></td>
                    <td><input type="button" class="class_control_button" value="Изменить запись" id="butChange${flower.id}"></td>
                    <td>${flower.name}</td>
                    <td>${flower.price}</td>
                    <td>${flower.status}</td>
                    <td>${flower.flower_vid?.name || ''}</td>
                    <td><input type="button" class="class_control_button" value="⇓ Добавить фото" id="butChangeImg${flower.id}"></td>
                    <td><input type="button" class="class_control_button" value="+ Добавить описание" id="butChangeDisc${flower.id}"></td>
                    <td>${flower.mKeyWords || ''}</td>
                    <td>${flower.mDescript || ''}</td>
                `;
                table.appendChild(tr);
  
                const data : typeData = {
                    'id': flower.id, 
                    'name': flower.name,
                    'price': flower.price,
                    'status': flower.status || '',
                    'vidTitle': flower.flower_vid?.name || '',
                    'mKeyWords': flower.mKeyWords,
                    'mDescript': flower.mDescript
                };
                // Активация базовых кнопок строки
                document.getElementById(`butDelete${flower.id}`)?.addEventListener('click', (e) => { deleteItemUniversal(e); });    
                document.getElementById(`butChange${flower.id}`)?.addEventListener('click', (e) => { showChange(e, data); });    

                document.getElementById(`butChangeImg${flower.id}`)?.addEventListener('click', (event : Event) => {imgItemFlower(event)}, false);   
                document.getElementById(`butChangeDisc${flower.id}`)?.addEventListener('click',  (event : Event) => {descItemFlower(event, null)}, false);

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
           totalPages = data.pages || 1
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
           totalPages = data.pages || 1
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
function imgItemFlower(event: Event): void {
    currentMode = 'flowersPhoto';
    showChange(event, null); 

    const target = event.target as HTMLElement | null;
    if (!target) return;

    const linkIdChange = target.id.replace('butChangeImg', '');
    const flowerId = linkIdChange ? parseInt(linkIdChange) : 0;

    const uploadContainer = document.getElementById('uploadPhotoContainer');
    if (uploadContainer) {
        uploadContainer.innerHTML = `
            <input type="button" id="modalAddPhotoPart" class="class_control_button" value="⊕ Добавить поле для фото" style="background-color: #4caf50; color: white; padding: 7px; margin-bottom: 10px;">
            <span id="modal_flower_id_hidden" style="display:none">${flowerId}</span>
        `;
    }

    const table = document.getElementById('myModalTableFlowerImg') as HTMLTableElement | null;
    if (table) table.innerHTML = '';

    // Добавление нового пустого поля для загрузки фото
    document.getElementById('modalAddPhotoPart')?.addEventListener('click', () => {
        const tableEl = document.getElementById('myModalTableFlowerImg') as HTMLTableElement | null;
        if (!tableEl) return;
        
        const curLength = tableEl.querySelectorAll('.img-row-block').length;
        const rowGroup = document.createElement("tbody");
        rowGroup.className = 'img-row-block new-image-row'; // Родительский блок строки
        rowGroup.id = `imgRowLocal_${curLength}`;

        rowGroup.innerHTML = `
            <tr><td>ID цветка</td><td class="spanFlowerId">${flowerId}</td></tr>
            <tr>
                <td>Фото</td>
                <td class="file-upload-zone">
                    <input type="file" class="new-file-input" id="fileInput_${curLength}"/><br><br>
                    <input type="submit" class="class_control_button action-upload" value="⚙️ Загрузить изображение" id="uploadBut_${curLength}">
                </td>
            </tr>
            <tr><td>Порядок</td><td><input class="spanFlowerNum" type="text" value="${curLength + 1}"></td></tr>
            <tr><td></td><td><input type="button" class="class_control_button call-delete" value="Удалить поле" id="delImg_${curLength}"></td></tr>
        `;
        tableEl.appendChild(rowGroup);

        document.getElementById(`uploadBut_${curLength}`)?.addEventListener('click', (e) => {
            uploadSingleFileToServer(e, curLength); // Функция отправки файла в /uploads из прошлого шага
        });

        document.getElementById(`delImg_${curLength}`)?.addEventListener('click', () => {
            rowGroup.remove();
        });
    });

    // Получение уже существующих в БД картинок
    fetch(`/api/imgs/getAll/${flowerId}`, {
        method: "GET",
        headers: { "content-Type": "application/json" }
    })
    .then((response) => response.json())
    .then((data: any) => {
        console.log(data);
        if (data.mes || data.message) {
            const mistake = document.getElementById('modalMistake') as HTMLElement | null;
            if (mistake) mistake.innerHTML = String(data.mes || data.message);
            return;
        }       
        if (table && data.rows) {
            data.rows.forEach((imageObj: any) => {
                const rowGroup = document.createElement("tbody");
                rowGroup.className = 'img-row-block existing-image-row'; // Родительский блок строки
                rowGroup.setAttribute('data-id', String(imageObj.id));   // Сюда пишется ID
                rowGroup.setAttribute('data-imgname', imageObj.img);     // Сюда пишется имя файла

                rowGroup.innerHTML = `
                    <tr><td>ID цветка</td><td class="spanFlowerId">${flowerId}</td></tr>
                    <tr>
                        <td>Фото</td>
                        <td>
                            <div><img src="/imgStoreMINI/${imageObj.img}" width="60" style="border-radius: 4px;"></div>
                            <span class="spanName">${imageObj.img}</span>
                        </td>
                    </tr>
                    <tr><td>Порядок</td><td><input class="spanFlowerNum" type="text" value="${imageObj.num}"></td></tr>
                    <tr><td></td><td><input type="button" class="class_control_button call-delete" value="Удалить из БД" id="delDbImg_${imageObj.id}"></td></tr>
                `;
                table.appendChild(rowGroup);
                
                document.getElementById(`delDbImg_${imageObj.id}`)?.addEventListener('click', () => { 
                    delOneImgDB(imageObj.id);
                });
            });
        }
    })
    .catch((error) => console.error('Ошибка загрузки картинок:', error));

    // Настраиваем главную кнопку сохранения всей модалки
const mainSaveBut = document.getElementById('control_modal_save') || document.getElementById('saveItem_but');
if (mainSaveBut) {
    mainSaveBut.onclick = null;
    // ИСПРАВЛЕНО: Передаем событие клика (e), чтобы сработал preventDefault
    mainSaveBut.onclick = (e) => saveWholeGallery(e); 
}
}
async function uploadSingleFileToServer(e: Event, index: number): Promise<void> {
    const button = e.target as HTMLButtonElement | null;
    if (!button) return;
 console.log('in uploadSingleFileToServer')
    const rowGroup = button.closest('.img-row-block') as HTMLElement | null;
    const fileInput = rowGroup?.querySelector('.new-file-input') as HTMLInputElement | null;
    const uploadZone = rowGroup?.querySelector('.file-upload-zone') as HTMLElement | null;

    // ВАЖНО: берем именно files[0], а не коллекцию FileList целиком
    if (!fileInput || !fileInput.files || fileInput.files.length === 0 || !uploadZone || !rowGroup) {
        alert('Пожалуйста, выберите файл перед загрузкой!');
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]); // ИСПРАВЛЕНО: передаем конкретный файл!

    console.log(formData);
    uploadZone.innerHTML = '<span style="color: #666; font-size: 13px;">⚙️ Нарезка GM...</span>';

   // const localToken = localStorage.getItem('floweridaKey');
    try {
        // Шлем строго на глобальный эндпоинт /uploads согласно вашему uploadRouter
        console.log('api/uploads');
        const response = await fetch('api/uploads', {
            method: "POST",
            /*headers: {  "Authorization": `Bearer ${localToken || ''}` },*/
            body: formData // Браузер сам выставит multipart/form-data
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Сервер вернул ошибку: ${errText}`);
        }
        
        const generatedImageName = await response.text(); // Получаем имя сохраненного файла
        
        console.log(`[Фронтенд] Успешно загружен файл: ${generatedImageName}`);

        // Записываем имя файла в атрибут родительского tbody для последующего сбора пачкой
        rowGroup.setAttribute('data-imgname', generatedImageName.trim());

        // Меняем ячейку на красивое превью
        uploadZone.innerHTML = `
            <div style="margin-bottom: 5px;">
                <img src="/imgStoreMINI/${generatedImageName.trim()}" width="60" style="border-radius: 4px; border: 1px solid #ccc;">
            </div>
            <span style="color: #4caf50; font-size: 12px; font-weight: bold;">✓ Готов к сохранению</span>
        `;

    } catch (error: any) {
        console.error('[Фронтенд] Ошибка загрузки файла на сервер:', error);
        alert('Не удалось загрузить файл. Возможно, истекла сессия админа.');
        
        uploadZone.innerHTML = `
            <span style="color: red; font-size: 12px;">Сбой загрузки</span><br>
            <input type="file" class="new-file-input" id="fileInput_${index}"/><br>
            <input type="button" class="class_control_button" value="Повторить" id="uploadBut_${index}" style="margin-top:5px; padding:2px 5px;">
        `;
        document.getElementById(`uploadBut_${index}`)?.addEventListener('click', (ev) => uploadSingleFileToServer(ev, index));
    }
}
//add pic
async function addFileUniversal(e: Event, flowerId: number, originalEvent: Event): Promise<void> {
    const fileInput = e.target as HTMLInputElement | null;
    const status = document.getElementById('uploadStatus') as HTMLElement | null;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]); // Передаем выбранный файл
console.log('formData ', formData);
    // Считаем текущее количество картинок в таблице для инкремента num
    const num: number = document.querySelectorAll('#myModalTableFlowerImg > tr')?.length + 1;

    if (status) {
        status.style.color = '#666';
        status.innerHTML = 'Загрузка...';
    }
 console.log('status');
 //   const localToken = localStorage.getItem('floweridaKey');

    try {
        // Шаг 1: Загружаем картинку на бэкенд для нарезки через GraphicsMagick
        console.log('/uploads');
        const uploadResponse = await fetch('api/uploads', {
            method: "POST",
          //  headers: { "Authorization": `Bearer ${localToken}` },
            body: formData
        });

        const imageName = await uploadResponse.text();
 console.log('imageName ',imageName);
        // Шаг 2: Создаем запись связи картинки и цветка в базе данных
        const dbResponse = await fetch('/api/imgs/saveGalleryGroup', {
            method: "PUT",
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
async function descItemFlower(event: Event, idEl : number | null): Promise<void> {
    currentMode = 'flowersDescription';
    showChange(event, null);

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Вычисляем flowerId из строки таблицы товаров
    const trId = target.id;
    const trNumChange = trId.replace('butChangeDisc', '');
    const trNum = trNumChange ? parseInt(trNumChange) : '';
    const flowerId = trNum ? trNum : idEl;
    //const flowerIdSelector = document.querySelector(`#control_table > tr:nth-child(${rowIndex}) > td:nth-child(3)`) as HTMLElement | null;
    //const flowerId = flowerIdSelector ? parseInt(flowerIdSelector.innerHTML) : 0;
  console.log('flowerId ', flowerId, idEl);
    let editInfo ={
        title: "",
        description: "",
        flowerId: flowerId,
        id: 0
    };
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
        editInfo.id = table.querySelectorAll('.descr-row').length;

        const rowGroup = document.createElement("tbody");
        rowGroup.className = 'descr-row'; // Класс-маркер для сбора данных, БЕЗ data-id
        rowGroup.id = `descrRowLocal_${editInfo.id}`;
        const webPartForm :  string = moduleWebPart.desription(editInfo);
      /*  rowGroup.innerHTML = `
            <tr><td>Название блока</td><td><input type="text" class="inputInfoTitle"></td></tr>
            <tr><td>Описание блока</td><td><textarea class="inputInfoText"></textarea></td></tr>
            <tr style="border-bottom: 2px solid grey;">
                <td><span class="infoIdDiscr" style='opacity:0'></span></td>
                <td><input type="button" class="class_control_button" id="linkLocal_${curLength}" value='Удалить описание' style="margin-bottom:15px"></td>
            </tr>
        `;*/
        
        rowGroup.innerHTML = webPartForm;
        table.appendChild(rowGroup);
        // Локальное удаление формы (так как в БД записи еще нет)
        document.getElementById(`linkLocal_${editInfo.id}`)?.addEventListener('click', () => rowGroup.remove());
    });

    const table = document.getElementById('myModalTableFlowerDis') as HTMLTableElement | null;
    if (table) table.innerHTML = '';

 //   const localToken = localStorage.getItem('floweridaKey');
    
    // Загружаем сохраненные данные из бэкенда
    fetch(`/api/info/getAll/${flowerId}`, {
        method: "GET",
//        headers: { "content-Type": "application/json", "Authorization": `Bearer ${localToken}` }
        headers: { "content-Type": "application/json" }        
    })
    .then((response) => response.json())
    .then((data: ApiResponse<FlowerInfoAttributes>) => {
        const mist = document.getElementById('modalMistake');
        if (data.mes){
            if(mist) mist.innerHTML = 'В базе нет ни одного описания к этому цветку'
        }

        if (data.rows && table) {

            data.rows.forEach((info) => {
                const rowGroup = document.createElement("tbody");
                rowGroup.className = 'descr-row';
                rowGroup.setAttribute('data-id', String(info.id)); // Маркер существующей записи
                editInfo.title = String(info.title);                
                editInfo.description = String(info.description) || '';
                editInfo.id = Number(info.id) || 0;
                const webPartForm :  string = moduleWebPart.desription(editInfo);
                rowGroup.innerHTML = webPartForm;
               /* rowGroup.innerHTML = `
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
                `;*/
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

    contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
          <tr id="Itd2"><td>ID</td><td id="modal_flower_id">${dataVal.id}</td></tr>
          <tr><td>Вид</td>
              <td><input id="modal_flower_vid_input" type="text" list="vids_list" value="${dataVal.vidTitle || ''}" placeholder="Начните вводить вид...">
                    <datalist id="vids_list"></datalist></td></tr>
          <tr><td>Название</td><td ><input id="modal_flower_name" type="text" value="${dataVal.name}"></td></tr>
          <tr><td>Цена</td><td><input id="modal_flower_price" type="text" value="${dataVal.price}"></td></tr>
          <tr><td>Статус</td><td><input id="modal_flower_status" type="text" value="${dataVal.status}"></td></tr>
          <tr><td>mKey</td><td><input id="modal_flower_key" type="text" value="${dataVal.mKeyWords}"><span class="textMeta">Значение key для метатега </span></td></tr>   
          <tr><td>mDescription </td><td><input id="modal_flower_mDis" type="text" value="${dataVal.mDescript}"><span class="textMeta">Значение description для метатега </span> </td></tr>   
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
        const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null; // Ошибка выводится в общую область модалки
        mistakeForm.innerHTML = '';
        if (mistakeForm) mistakeForm.innerHTML = data.mes || data.message || '';
        }   
    });
}
// ==========================================
// ВАРИАНТ 2: Сохранение / Добавление вида цветов
// ==========================================

if (currentMode === 'vids') {
  const idForm = document.getElementById('modal_vid_id') as HTMLElement || null;
  const nameForm =  document.getElementById('modal_vid_name') as HTMLInputElement || null;

  if (!nameForm) return;

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
            const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null; // Ошибка выводится в общую область модалки
            if (mistakeForm){
                mistakeForm.innerHTML = '';
                if (data.mes || data.message) mistakeForm.innerHTML = data.mes || data.message || '';
            }
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
  const statusForm = document.getElementById('modal_flower_status') as HTMLInputElement || null;
  const mKeyWordsFrom = document.getElementById('modal_flower_key') as HTMLInputElement || null;
  const mDescriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidNameFrom = document.getElementById('modal_flower_vid_input') as HTMLSelectElement || null;
  const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;
    if(mistakeForm) mistakeForm.innerHTML = '';

fetch('/api/flower/change',{
        method: "PUT",
        //headers: {"content-Type": "application/json", "Authorization": `Bearer ${localToken}`},
        headers: {"content-Type": "application/json"},
        body: JSON.stringify({
          'id': idForm ? Number(idForm.innerHTML) : '', 
          'name':nameForm ? nameForm.value : '', 
          'price':priceForm ? Number(priceForm.value) : '', 
          'status':statusForm ? statusForm.value : '',
          'vidName':vidNameFrom ? vidNameFrom.value : '', 
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
  //  const localToken = localStorage.getItem('floweridaKey');
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
  //  const localToken = localStorage.getItem('floweridaKey');
    const flowerIdEl = document.getElementById('modal_flower_id_hidden');
    const flowerId = flowerIdEl ? parseInt(flowerIdEl.innerHTML) : 0;
    const mistakeForm = document.getElementById('modalMistake') as HTMLElement || null;
    if(mistakeForm) mistakeForm.innerHTML = '';

    const descrRows = document.querySelectorAll('#myModalTableFlowerDis .descr-row');
    const descriptionsData: {id?: number, title: string, description: string }[] = [];

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

    fetch('/api/info/update', {
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
   const trNum = Number(parseInt(trNum0));  
   const idForm = document.querySelector('#control_table > tr:nth-child('+trNum+') > td:nth-child(3)') as HTMLElement || null;
   if (!idForm) return;
   const id = idForm? idForm.innerHTML : '';
   
   fetch(`/api/flower/delete/${trNum}`,{
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
            console.log('infoId ', data.flowerId);
            descItemFlower(event, Number(data.flowerId));  
        } else {
            if(data.mes || data.message){
              const mistake = document.getElementById('mist3') as HTMLElement || null;
              if(mistake) mistake.innerHTML = String(data.mes || data.message);
              return ;
            }
           descItemFlower(event, Number(data.flowerId));   
        }
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
      <tr>
        <td>Вид</td>
        <td>
            <input id="modal_flower_vid_input" type="text" list="vids_list" placeholder="Начните вводить вид...">
            <datalist id="vids_list"></datalist>
        </td>
      </tr>     
      <tr><td>Название</td><td><input id="modal_flower_name" type="text"></td></tr>
      <tr><td>Цена</td><td><input id="modal_flower_price" type="text"></td></tr>
      <tr><td>Статус</td><td><input id="modal_flower_status" type="text"></td></tr>
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
          <input class="newImgInput" id="addImgToForm${curTableLength + 1}" type="file" accept="image/*">
        </td>
       </tr>
       <tr><td>Порядок</td><td><input type="text" class="spanFlowerNum" value="${curTableLength + 1}"></td></tr>
       <tr><td></td><td><input type="button" class="class_control_button remove-local-row" id="modalDelImg${curTableLength+1} value="Удалить форму"></td></tr>
    </tbody>
`;
contentTargetPh.insertAdjacentHTML('beforeend', htmlBlock);

document.getElementById('addImgToForm${curTableLength + 1}')?.addEventListener('change', (e: Event) => { 
    handleFileSelect(event);
});
    document.getElementById(`modalDelImg${curTableLength + 1}`)?.addEventListener('click', (e: Event) => { 
         deleteItemUniversal(e);
         const tableDel = document.getElementById(`modalTable${curTableLength}`) as HTMLTableElement || null;
         if(tableDel) tableDel.remove();
    });
     // Как только открылась форма добавления из addItemUniversal,
    // СРАЗУ подписываемся на появившиеся кнопки выбора и отправки файла!
    const btnAdd = document.getElementById(`modalAddPhotoBtn${curTableLength}`) as HTMLInputElement | null;
    const fileInput = document.getElementById(`modalAddPhotoInput${curTableLength}`) as HTMLInputElement | null;

    /*if (btnAdd) btnAdd.onclick = () => fileInput?.click();
    if (fileInput) {
        fileInput.onchange = (changeEvent: Event) => {
            addFileUniversal(changeEvent, Number(flowerIDItem || 0), event);
        };
    }*/
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
      if(mistakeForm) mistakeForm.innerHTML = '';
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
  const statusForm = document.getElementById('modal_flower_status') as HTMLInputElement || null;
  const mKeyWordsFrom = document.getElementById('modal_flower_key') as HTMLInputElement || null;
  const mDescriptFrom = document.getElementById('modal_flower_mDis') as HTMLInputElement || null;
  const vidIdFrom = document.getElementById('modal_flower_vid_input') as HTMLInputElement || null;
  let name = nameForm ? nameForm.value : '';
  let price = priceForm ? priceForm.value : '';
  let status = statusForm ? statusForm.value : '';
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
            body: JSON.stringify({'name':name, 'price':price, 'status':status,  'vidName':vidName, 'mKeyWords':mKeyWords, 'mDescript':mDescript})
            })
            .then((response) => response.json())
            .then((data : FlowerAttributes & ApiResponse) =>{
              if (data.mes || data.message) {
                if(mistakeForm) mistakeForm.innerHTML = String(data.mes || data.message);
                return ;
              }
             if (data && data.id) {
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
    const vidInput = document.getElementById('modal_flower_vid_input') as HTMLInputElement | null;
    const datalist = document.getElementById('vids_list') as HTMLDataListElement | null;
    
    // Если на странице нет инпута или даталиста, прерываем выполнение
    if (!datalist || !vidInput) return;

    try {
        // Делаем запрос к вашему API за всеми видами цветов
        const response = await fetch('/api/vid/getAll', {
            method: "GET",
            headers: { "content-Type": "application/json" }
        });
        
        const data: ApiResponse<VidAttributes> = await response.json();
        
        if (data.mes || data.message) {
            console.error('Ошибка бэкенда при загрузке видов:', data.mes || data.message);
            return;
        }

        // Очищаем datalist от старых подсказок перед заполнением
        datalist.innerHTML = '';

        if (data.rows && data.rows.length > 0) {
            // Пробегаемся по видам из БД и генерируем option для datalist
            data.rows.forEach((vid) => {
                if (vid.name) {
                    const option = document.createElement('option');
                    // ВАЖНО: записываем именно имя (string). 
                    // Браузер использует это значение и для фильтрации при вводе, и для отправки.
                    option.value = vid.name; 
                    datalist.appendChild(option);
                }
            });
        } else {
            console.log('Виды цветов в базе данных пока отсутствуют');
        }

    } catch (err) {
        console.error('Критическая ошибка сети при получении видов для datalist:', err);
    }
}
function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file); // 'file' должно совпадать с multer fields

    const localToken = localStorage.getItem('floweridaKey');

    // Направляем строго на загрузчик файлов
    fetch('/api/uploads', { 
        method: "POST",
        headers: { "Authorization": `Bearer ${localToken}` }, // если защищено
        body: formData
    })
    .then(res => res.text()) // Ждем имя файла в виде строки
    .then(generatedImgName => {
        if (!generatedImgName) return;

        // Находим контейнер в модалке, куда складываем строки картинок
        const galleryContainer = document.getElementById('modalDynamicContent'); 
        const currentRowsCount = document.querySelectorAll('.img-row-block').length;

        // Создаем блок для новой картинки на экране (БЕЗ id, так как в БД её еще нет!)
        const newBlock = document.createElement('div');
        newBlock.className = 'img-row-block';
        newBlock.setAttribute('data-id', ''); // Новая, ID пустой
        newBlock.setAttribute('data-imgname', generatedImgName); // Запоминаем имя файла!

        newBlock.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="/imgStoreMINI/${generatedImgName}" alt="preview" style="width: 50px; height: 50px; margin-right: 10px;">
                <span>Порядок: </span>
                <input type="button" value="Удалить" class="class_control_button" id="deleteImg${currentRowsCount + 1}" onclick="this.closest('.img-row-block').remove()">
            </div>
        `;
        galleryContainer?.appendChild(newBlock);
    })
    .catch(err => console.error('Ошибка предзагрузки файла:', err));
    // <input type="text" class="spanFlowerNum" value="${currentRowsCount + 1}" style="width: 40px; margin-left: 5px;">
}
function saveWholeGallery(e?: Event) {
    if (e) e.preventDefault();

    // Предположим, у вас скрытый спан или инпут с ID цветка в модалке
    const flowerIdEl = document.getElementById('modal_flower_id_hidden') || document.getElementById('modal_flower_id');
    const flowerId : number = flowerIdEl ? Number(flowerIdEl.innerHTML || (flowerIdEl as HTMLInputElement).value) : 0;
    
    const imagesData: any[] = [];
    const blocks = document.querySelectorAll('.img-row-block');
    
    blocks.forEach((block, index) => {
        const id = block.getAttribute('data-id'); 
        const imgName = block.getAttribute('data-imgname'); 
        // Строго приводим к HTMLInputElement, чтобы забрать .value
        const numInput = block.querySelector('.spanFlowerNum') as HTMLInputElement | null;

        if (!imgName || imgName.trim() === "") return; 

        imagesData.push({
            // Если ID пустой или отсутствует (новая картинка) — передаем null
            id: (id && id.trim() !== "") ? Number(id) : null,
            img: imgName.trim(),
            num: numInput ? Number(numInput.value) : (index + 1)
        });
    });

    if (imagesData.length === 0) {
        alert('Нет картинок для сохранения!');
        return;
    }

    fetch('/api/imgs/updateGalleryGroup', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowerId: flowerId, images: imagesData })
    })
    .then(res => res.json())
    .then(data => {
        if (data.change === 'ok') {
            alert('Вся галерея успешно синхронизирована в БД!');
            closeItem('adminUniversalModal'); 
            correctFlowers(currentPage); 
        } else {
            alert('Ошибка сохранения: ' + (data.mes || 'Неизвестная ошибка'));
        }
    })
    .catch(err => console.error('Ошибка пакетного fetch:', err));
}

function sendWholeGalleryToServer(flowerId: number): void {
    const imagesData: any[] = [];
    const blocks = document.querySelectorAll('.img-row-block');
    const mistakeForm = document.getElementById('modalMistake') as HTMLElement | null;

    blocks.forEach((block) => {
        const id = block.getAttribute('data-id'); // Будет число (для старых) или null (для новых)
        const imgName = block.getAttribute('data-imgname'); // Текстовое имя файла с диска
        const numInput = block.querySelector('.spanFlowerNum') as HTMLInputElement | null;

        // Если файл еще не загружен на диск, игнорируем пустую строку
        if (!imgName) return; 

        imagesData.push({
            id: id ? Number(id) : null,
            img: imgName,
            num: numInput ? (Number(numInput.value) || 0) : 0
        });
    });

    if (imagesData.length === 0) {
        if (mistakeForm) mistakeForm.innerHTML = 'Нет изображений для сохранения!';
        return;
    }

    // Отправляем всю пачку структурным JSON-запросом через PUT эндпоинт
    fetch('/api/imgs/updateGalleryGroup', {
        method: "PUT",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({ flowerId: flowerId, images: imagesData })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mes || data.message) {
            if (mistakeForm) mistakeForm.innerHTML = String(data.mes || data.message);
            return;
        }

        if (data.change === 'ok') {
            alert('Галерея изображений успешно синхронизирована!');
            closeItem(modalViewItem); // Закрываем модальное окно
            correctFlowers(currentPage); // Обновляем основную таблицу админки
        }
    })
    .catch(err => {
        console.error('Ошибка сохранения галереи:', err);
        if (mistakeForm) mistakeForm.innerHTML = 'Ошибка соединения с сервером при сохранении';
    });
}
function updatePaginationInterface(): void {
    const preBtn = document.getElementById('pre') as HTMLButtonElement | null;
    const nextBtn = document.getElementById('next') as HTMLButtonElement | null;

    if (preBtn) {
        // Если страница первая — отключаем кнопку "Назад"
        preBtn.disabled = currentPage === 1;
        preBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
        preBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
    }

    if (nextBtn) {
        // Если страница последняя — отключаем кнопку "Вперед"
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.style.opacity = currentPage >= totalPages ? '0.5' : '1';
        nextBtn.style.cursor = currentPage >= totalPages ? 'not-allowed' : 'pointer';
    }
}