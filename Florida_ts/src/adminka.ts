import { ApiResponse, UserAttributes, VidAttributes, FlowerAttributes, FlowerImgsAttributes, FlowerInfoAttributes } from './types.js';
import { moduleWebPartUser } from './components/partishional.js';
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
        const isEditUser = (currentMode === 'users') ? 'false' : null;
        console.log(isEditFlower, isEditVid, isEditUser);

        if(currentMode === 'users'){
            console.log('save change');
            correctItem();        
        }
        else if(currentMode === 'vids'){
            if (isEditVid){
                console.log('save change');
                correctItem();        
            }
            else{
                console.log('create');
                addItemSaveUniversal();                   
            }    
       }
       if(currentMode === 'flowers'){
            if(isEditFlower){
                console.log('save change');
                correctItem();        
            }
            else if(!isEditFlower){
                console.log('create');
                addItemSaveUniversal();   
            }        
       }
        else if(currentMode === 'flowersPhoto'){
            if(imgsEl){
                console.log('save change');
               // addItemUniversal(event : Event);
             // saveWholeGallery();   
            }            
        }
        else if(currentMode === 'flowersDescription'){
            if(discIdEl){
                console.log('save change');
                correctItem();   
            }            
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
                'id': number;
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
                    'id': user.id,
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
    let infoImg = {
        'num': Number(curLength),
        'flowerId': flowerId
    };       
    const rowGroup = document.createElement("tbody");     
    rowGroup.className = 'img-row-block new-image-row'; 
    rowGroup.id = `imgRowLocal_${curLength}`;

    // Рендерим пустую строку с <input type="file" class="new-file-input" id="fileInput_\${curLength}">
    rowGroup.innerHTML = moduleWebPart.imgs(infoImg, 'New');
    tableEl.appendChild(rowGroup);

    // ИСПРАВЛЕНО 1: Находим созданный инпут внутри ТОЛЬКО ЧТО ДОБАВЛЕННОЙ строки
    const fileInputEl = rowGroup.querySelector(`#fileInput_${curLength}`) as HTMLInputElement | null;
    
    if (fileInputEl) {
        fileInputEl.addEventListener('change', (e: Event) => {
            uploadSingleFileToServer(e, curLength);
        });
    }

    // Обработчик удаления локальной строки до сохранения
    document.getElementById(`newDelImg_${curLength}`)?.addEventListener('click', () => {
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
                rowGroup.className = 'img-row-block existing-image-row'; 
                rowGroup.setAttribute('data-id', String(imageObj.id));   
                rowGroup.setAttribute('data-imgname', imageObj.img);     

                // Передаем статус 'Edit' для рендера текущей картинки
                rowGroup.innerHTML = moduleWebPart.imgs(imageObj, 'Edit');
                table.appendChild(rowGroup);              

                 rowGroup.querySelector('.call-delete')?.addEventListener('click', (event) => {
                    delOneImgDB(event);
                });
            });
        }
    })
    .catch((error) => console.error('Ошибка загрузки картинок:', error));

    // Настраиваем главную кнопку сохранения всей модалки
const mainSaveBut = document.getElementById('control_modal_save') || document.getElementById('saveItem_but');
if (mainSaveBut) {
    mainSaveBut.onclick = null;
    mainSaveBut.onclick = (e) => saveWholeGallery(e); 
}
}
async function uploadSingleFileToServer(e: Event, index: number): Promise<void> {
 const inputEl = e.target as HTMLInputElement | null;
        if (!inputEl) return;
        
        console.log('Начало автозагрузки выбранного файла в uploadSingleFileToServer');
        
        // Теперь closest('.img-row-block') сработает идеально, так как мы добавили этот класс в tbody
        const rowGroup = inputEl.closest('.img-row-block') as HTMLElement | null;
        const fileInput = rowGroup?.querySelector('.new-file-input') as HTMLInputElement | null;
        const uploadZone = rowGroup?.querySelector('.file-upload-zone') as HTMLElement | null;

        if (!fileInput || !fileInput.files || fileInput.files.length === 0 || !uploadZone || !rowGroup) {
            alert('Пожалуйста, выберите файл перед загрузкой!');
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]); // Передаем конкретный бинарный файл

        uploadZone.innerHTML = '<span style="color: #666; font-size: 13px;">⚙️ Нарезка GM...</span>';

        try {
            // Шлем запрос на ваш глобальный эндпоинт загрузки картинок
            const response = await fetch('/api/uploads', {
                method: "POST",
                body: formData 
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Сервер вернул ошибку: ${errText}`);
            }
            
            const generatedImageName = await response.text(); 
            
            console.log(`[Фронтенд] Успешно загружен файл: ${generatedImageName}`);

            rowGroup.setAttribute('data-imgname', generatedImageName.trim());

            // Заменяем зону выбора красивым мини-превью
            uploadZone.innerHTML = `
                <div style="margin-bottom: 5px;">
                    <img src="/imgStoreMINI/${generatedImageName.trim()}" width="60" style="border-radius: 4px; border: 1px solid #ccc;">
                </div>
                <span style="color: #4caf50; font-size: 12px; font-weight: bold;">✓ Готов к сохранению</span>
            `;

        } catch (error: any) {
            console.error('[Фронтенд] Ошибка загрузки файла на сервер:', error);
            alert('Не удалось загрузить файл.');
            
            // В случае сбоя даем возможность выбрать файл повторно
            uploadZone.innerHTML = `
                <span style="color: red; font-size: 12px;">Сбой загрузки</span><br>
                <input type="file" class="new-file-input" id="fileInput_${index}"/><br>
            `;
            
            // Перепривязываем обработчик события на новый созданный инпут
            document.getElementById(`fileInput_${index}`)?.addEventListener('change', (ev) => {
                uploadSingleFileToServer(ev, index);
            });
        }
}
//del img db
async function delOneImgDB(event :Event): Promise<void> {
//const localToken = localStorage.getItem('floweridaKey');
console.log('in delOneImgDB');
console.log('in delOneImgDB');
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Находим родительский блок строки tbody, где лежит реальный ID из базы данных
    const rowGroup = target.closest('.img-row-block') as HTMLElement | null;
    if (!rowGroup) return;

    const dbId = rowGroup.getAttribute('data-id');
    if (!dbId) {
        // Если data-id нет, значит это новая картинка, её просто удаляем из DOM
        rowGroup.remove();
        return;
    }

    console.log('Реальный ID картинки в БД:', dbId);

    try {
        const response = await fetch(`/api/imgs/delete/${dbId}`, {
            method: "DELETE",
            headers: { "content-Type": "application/json" }
        });
        
        const data = await response.json();
        const mistake = document.getElementById('modalMistake') as HTMLElement | null;            
        
        if (data.mes || data.message) {
            if (mistake) mistake.innerHTML = String(data.mes || data.message);
            return;
        }

        if (mistake) mistake.innerHTML = `Изображение успешно удалено`;
        
        // Самое главное: удаляем строку с экрана, чтобы юзер видел изменения!
        rowGroup.remove();

    } catch (error) {
        console.error('Ошибка удаления картинки из БД:', error);
    }
}

//Нажали Добавить-описание товара
async function descItemFlower(event: Event, idEl : number | null): Promise<void> {
    currentMode = 'flowersDescription';
    showChange(event, null);

    const target = event.target as HTMLElement | null;
    if (!target) return;

    const trId = target.id;
    const trNumChange = trId.replace('butChangeDisc', '');
    const trNum = trNumChange ? parseInt(trNumChange) : '';
    const flowerId = trNum ? trNum : idEl;
    let editInfo ={
        title: "",
        description: "",
        flowerId: Number(flowerId),
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
    document.getElementById('modalAddDescriptionBtn')?.addEventListener('click', () => {
        const table = document.getElementById('myModalTableFlowerDis') as HTMLTableElement | null;
        if (!table) return;
        editInfo.id = table.querySelectorAll('.descr-row').length;

        const rowGroup = document.createElement("tbody");
        rowGroup.className = 'descr-row'; // Класс-маркер для сбора данных, БЕЗ data-id
        rowGroup.id = `descrRowLocal_${editInfo.id}`;
        const webPartForm :  string = moduleWebPart.description(editInfo, 'New');
        
        rowGroup.innerHTML = webPartForm;
        table.appendChild(rowGroup);
        document.getElementById(`linkLocal_${editInfo.id}`)?.addEventListener('click', () => rowGroup.remove());
    });

    const table = document.getElementById('myModalTableFlowerDis') as HTMLTableElement | null;
    if (table) table.innerHTML = '';

  
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
                //добавили веб-часть
                const webPartForm :  string = moduleWebPart.description(editInfo, 'Edit');
                rowGroup.innerHTML = webPartForm;
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

//-------------------------------------------------
//-------------------------------------------------
if (currentMode === 'users') {
    contentTarget.innerHTML = moduleWebPart.users(dataVal, 'Edit');
}
//-------------------------------------------------
//-------------------------------------------------
else if (currentMode === 'vids') {
     // Закачиваем разметку полей в единое окно
     const contentWebPart =  moduleWebPart.vid(dataVal, "Edit");
     contentTarget.innerHTML = ` <table id="myModalTable" style="margin-top: 25px; width: 100%;">
            ${contentWebPart}
        </table>
    `;
}
else if (currentMode === 'flowers') {

    contentTarget.innerHTML = moduleWebPart.flower(null,'New');
}
else if (currentMode === 'flowersPhoto') {
 let elButtonChange = trId.replace('butChangeImg', '');
 const idVal = elButtonChange ? elButtonChange : '';
  contentTarget.innerHTML = `
     <div id="uploadPhotoContainer" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
        <input type="button" id="modalAddPhotoPart" class="class_control_button" value="⊕ Добавить раздел с фото" style="background-color: #4caf50; color: white;">
         <span id="modal_flower_id_hidden" style="display:none">${idVal}</span>
      </div>
     <table id="myModalTableFlowerImg" style="padding-top: 25px; width: 100%;">
     </table>
  `;
}
else if (currentMode === 'flowersDescription') {
let elButtonChange = trId.replace('butChangeDisc', '');
 const idVal = elButtonChange ? elButtonChange : '';   
  contentTarget.innerHTML = `
     <div id="uploadDescrContainer" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
         <input type="button" id="modalAddDescriptionBtn" class="class_control_button" value="⊕ Добавить описание" style="background-color: #4caf50; color: white;">    
         <span id="modal_flower_id_hidden" style="display:none">${idVal}</span>
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
  let idVal = '', nameVal = '';
  if(idForm) idVal = idForm.innerHTML;
  if(nameForm) nameVal = nameForm.value;
  if (!nameForm) return;

fetch('/api/vid/change',{
        method: "PUT",
         headers: {"content-Type": "application/json"},
       // headers: {"content-Type": "application/json", "Authorization":  `Bearer ${localToken}`},
        body: JSON.stringify({'id':idVal, 'name':nameVal})
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
 // const localToken = localStorage.getItem('floweridaKey');
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
    const flowerIdEl = document.getElementById('modal_flower_id_hidden');
    const flowerId = flowerIdEl ? flowerIdEl.innerHTML.trim() : '';
    
    const formData = new FormData();
    formData.append('flowerId', flowerId);

    const imagesTemplate: any[] = [];
    let fileCounter = 0; // Счётчик для сопоставления с массивом файлов на бэкенде

    // Проходим по ВСЕМ строкам таблицы строго по порядку их отображения на экране
    document.querySelectorAll('#myModalTableFlowerImg .img-row-block').forEach((row) => {
        const numInput = row.querySelector('.spanFlowerNum') as HTMLInputElement | null;
        const currentNum = numInput ? parseInt(numInput.value, 10) || 0 : 0;

        if (row.classList.contains('existing-image-row')) {
            // Это старая картинка из БД
            const id = row.getAttribute('data-id');
            const imgName = row.getAttribute('data-imgname');
            if (id && imgName) {
                imagesTemplate.push({
                    id: parseInt(id, 10),
                    img: imgName, // Имя файла уже есть
                    num: currentNum
                });
            }
        } else if (row.classList.contains('new-image-row')) {
            // Это новая картинка, выбранная через input
            const fileInput = row.querySelector('.new-file-input') as HTMLInputElement | null;
            
            if (fileInput && fileInput.files && fileInput.files[0]) {
                formData.append('newFiles', fileInput.files[0]); // Складываем файл в FormData
                
                imagesTemplate.push({
                    id: null, // Сигнал для бэка, что это создание
                    num: currentNum,
                    fileIndex: fileCounter // Указываем бэкенду, какой файл из request.files взять
                });
                fileCounter++;
            }
        }
    });

    // Отправляем единую структуру расположения картинок
    formData.append('imagesTemplate', JSON.stringify(imagesTemplate));


    // Отправляем всё ОДНИМ групповым PUT-запросом
  //  fetch('/api/imgs/saveGalleryGroup', {
    fetch('/api/imgs/updateGalleryGroup', {
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

   
   fetch(`/api/imgs/delete/${trNum}`,{
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
    contentTarget.innerHTML = moduleWebPart.vid(null, "New")   

}
//----------Добавление нового цветка
if (currentMode === 'flowers') {
contentTarget.innerHTML = moduleWebPart.flower(null,'New');
    await populateVidsDropdown();
}
//----------Добавление нового изображения
else if (currentMode === 'flowersPhoto') {
    const contentTargetPh = document.getElementById('myModalTableFlowerImg');
    if (!contentTargetPh) return;

    // Считаем количество уже имеющихся блоков картинок в таблице
    const countAddPhotoPart = document.querySelectorAll('#myModalTableFlowerImg > .img-row-block');
    const curTableLength = countAddPhotoPart ? countAddPhotoPart.length : 0;
    
    const imgWebPart = moduleWebPart.imgs(null, 'New');
    
    const htmlBlock = `
        <tbody class="img-row-block new-image-row" id="imgRowLocal_${curTableLength}">
           ${imgWebPart}
        </tbody>
    `;
    
    contentTargetPh.insertAdjacentHTML('beforeend', htmlBlock);

    const newFileInput = document.getElementById(`fileInput_${curTableLength}`) as HTMLInputElement | null;
    
    if (newFileInput) {
        newFileInput.addEventListener('change', (e) => {
            uploadSingleFileToServer(e, curTableLength);
        });
    } 
    
    document.getElementById(`newDelImg_${curTableLength}`)?.addEventListener('click', ((event) =>{ document.getElementById(`imgRowLocal_${curTableLength}`)?.remove();}))
    document.getElementById(`delImg_${curTableLength}`)?.addEventListener('click', ((event) =>{ delOneImgDB(event);}))
}
//----------Добавление нового описания
else if (currentMode === 'flowersDescription') {
 const flowerId = document.querySelectorAll('#myModalTableFlowerDis > .flowerIdDiscr') as NodeListOf<Element> || null;
 
 let flowerItem = {flowerId : 0};
 if(flowerId && flowerId.length > 0) flowerItem.flowerId = Number(flowerId[0].innerHTML) || 0;
 const descWebPart = moduleWebPart.description(flowerItem, 'New');
  contentTarget.innerHTML = `
        <table id="myModalTable" style="padding-top: 25px; width: 100%;">
            ${descWebPart}
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
            data.rows.forEach((vid) => {
                if (vid.name) {
                    const option = document.createElement('option');
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

function saveWholeGallery(e?: Event) {
    if (e) e.preventDefault();
    const flowerIdEl = document.getElementById('modal_flower_id_hidden') as HTMLElement;
    const flowerId : number = flowerIdEl ? Number(flowerIdEl.innerHTML) : 0;
    
    const imagesData: any[] = [];
    const blocks = document.querySelectorAll('.img-row-block');
        console.log('blocks ', blocks);
    blocks.forEach((block, index) => {
        const id = block.getAttribute('data-id'); 
        const imgName = block.getAttribute('data-imgname'); 
        const numInput = block.querySelector('.spanFlowerNum') as HTMLInputElement | null;

        if (!imgName || imgName.trim() === "") return ; 

        imagesData.push({
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