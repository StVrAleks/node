    //allDataDB();
import { ApiResponse, FlowerImgsAttributes, FlowerAttributes, VidAttributes } from '../models/models';

// 1. Создаем строгий фронтенд-интерфейс для связки с картинками (БЕЗ any!)
interface IFlowerWithImages extends FlowerAttributes {
    flower_imgs?: FlowerImgsAttributes[];
    imgs?: FlowerImgsAttributes[]; // на случай если имя связи на бэкенде отличается
}

document.addEventListener('DOMContentLoaded', (): void => {
    let currentPage: number = 1;
    const itemsPerPage: number = 9; // По дефолту из контроллера
    let currentVidId: number | null = null; // Для фильтрации по категориям, если нужно

    function loadCatalog(page: number, vidId: number | null = null): void {
        let url = `/api/flower/getAll?page=${page}&limit=${itemsPerPage}`;
        if (vidId) {
            url += `&vidId=${vidId}`;
        }

        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        .then((response) => response.json())
        .then((data: ApiResponse<IFlowerWithImages>) => { // Используем наш строгий интерфейс
            
            const mist = document.getElementById('mist10') as HTMLElement | null;
            if (data.mes || data.message) {
                if (mist) mist.innerHTML = data.mes || data.message || 'Ошибка загрузки';
                return;
            }

            const catalogContainer = document.getElementById('catalog-products') as HTMLElement | null;
            if (!catalogContainer) return;
            
            // Очищаем каталог перед выводом новой порции
            catalogContainer.innerHTML = '';

            // Генерируем карточки цветов из data.rows
            if (data.rows && data.rows.length > 0) {
                data.rows.forEach((flower: IFlowerWithImages) => {
                    
                    // Ищем главную картинку (где num === 1) во вложенном массиве картинок
                    let mainImgPath: string = 'default.jpg'; // Ваша будущая дефолтная заглушка
                    
                    const flowerImages = flower.flower_imgs || flower.imgs; 
                    
                    if (flowerImages && flowerImages.length > 0) {
                        const mainImageObject = flowerImages.find((img: FlowerImgsAttributes) => Number(img.num) === 1);
                        if (mainImageObject) {
                            mainImgPath = mainImageObject.img; 
                        } else {
                            // ИСПРАВЛЕНО: Безопасный забор первой картинки
                            mainImgPath = flowerImages[0].img;
                        }
                    }

                    // Создаем элемент карточки
                    const section = document.createElement('section');
                    section.className = 'conteiner_section';

                    // Вставляем вашу верстку один в один (ИСПРАВЛЕН URL xmlns в SVG)
                    section.innerHTML = `
                        <div class="card">
                            <div class="card__top">
                                <h2 class="title_goods">${flower.name}</h2>
                                <div class="imgs_goods">
                                    <img src="/imgStore/${mainImgPath}" alt="${flower.name}">
                                </div>
                            </div>
                            <div class="card__botoom">
                                <div class="full_title" data-id="${flower.id}">${flower.name}</div>
                                <div class="price">${flower.price} ₽</div>
                                <div class="discriptionId">${flower.mDiscript || ''}</div>
                            </div>
                            <div class="card_control">
                                <input type="button" value="Купить" class="cardGood" style="padding-left: 23px;">
                                
                                <svg viewBox="0 0 1024 1024" class="icon icon-cart stroke-w-5" xmlns="http://w3.org" width="18px" height="50px" style="position: relative;">
                                    <path class="path1" d="M409.6 1024c-56.464 0-102.4-45.936-102.4-102.4s45.936-102.4 102.4-102.4S512 865.136 512 921.6 466.064 1024 409.6 1024zm0-153.6c-28.232 0-51.2 22.968-51.2 51.2s22.968 51.2 51.2 51.2 51.2-22.968 51.2-51.2-22.968-51.2-51.2-51.2z"></path>
                                    <path class="path2" d="M768 1024c-56.464 0-102.4-45.936-102.4-102.4S711.536 819.2 768 819.2s102.4 45.936 102.4 102.4S824.464 1024 768 1024zm0-153.6c-28.232 0-51.2 22.968-51.2 51.2s22.968 51.2 51.2 51.2 51.2-22.968 51.2-51.2-22.968-51.2-51.2-51.2z"></path>
                                    <path class="path3" d="M898.021 228.688C885.162 213.507 865.763 204.8 844.8 204.8H217.954l-5.085-30.506C206.149 133.979 168.871 102.4 128 102.4H76.8c-14.138 0-25.6 11.462-25.6 25.6s11.462 25.6 25.6 25.6H128c15.722 0 31.781 13.603 34.366 29.112l85.566 513.395C254.65 736.421 291.929 768 332.799 768h512c14.139 0 25.6-11.461 25.6-25.6s-11.461-25.6-25.6-25.6h-512c-15.722 0-31.781-13.603-34.366-29.11l-12.63-75.784 510.206-44.366c39.69-3.451 75.907-36.938 82.458-76.234l34.366-206.194c3.448-20.677-1.952-41.243-14.813-56.424zm-35.69 48.006l-34.366 206.194c-2.699 16.186-20.043 32.221-36.39 33.645l-514.214 44.714-50.874-305.246h618.314c5.968 0 10.995 2.054 14.155 5.782 3.157 3.73 4.357 9.024 3.376 14.912z"></path>
                                </svg>

                                <input type="button" class="watch" id="watch-${flower.id}" data-id="${flower.id}" value="Подробнее">
                                <input type="button" value="" class="like_good wishGood">
                                
                                <svg role="img" aria-hidden="true" viewBox="0 0 512 512" class="icon icon-wishlist" width="18px" height="50px">
                                    <path d="M474.644,74.27C449.391,45.616,414.358,29.836,376,29.836c-53.948,0-88.103,32.22-107.255,59.25 c-4.969,7.014-9.196,14.047-12.745,20.665c-3.549-6.618-7.775-13.651-12.745-20.665c-19.152-27.03-53.307-59.25-107.255-59.25 c-38.358,0-73.391,15.781-98.645,44.435C13.267,101.605,0,138.213,0,177.351c0,42.603,16.633,82.228,52.345,124.7 c31.917,37.96,77.834,77.088,131.005,122.397c19.813,16.884,40.302,34.344,62.115,53.429l0.655,0.574 c2.828,2.476,6.354,3.713,9.88,3.713s7.052-1.238,9.88-3.713l0.655-0.574c21.813-19.085,42.302-36.544,62.118-53.431 c53.168-45.306,99.085-84.434,131.002-122.395C495.367,259.578,512,219.954,512,177.351 C512,138.213,498.733,101.605,474.644,74.27z M309.193,401.614c-17.08,14.554-34.658,29.533-53.193,45.646 c-18.534-16.111-36.113-31.091-53.196-45.648C98.745,312.939,30,254.358,30,177.351c0-31.83,10.605-61.394,29.862-83.245 C79.34,72.007,106.379,59.836,136,59.836c41.129,0,67.716,25.338,82.776,46.594c13.509,19.064,20.558,38.282,22.962,45.659 c2.011,6.175,7.768,10.354,14.262,10.354c6.494,0,12.251-4.179,14.262-10.354c2.404-7.377,9.453-26.595,22.962-45.66 c15.06-21.255,41.647-46.593,82.776-46.593c29.621,0,56.66,12.171,76.137,34.27C471.395,115.957,482,145.521,482,177.351 C482,254.358,413.255,312.939,309.193,401.614z"></path>
                                </svg>
                            </div>
                        </div>
                    `;

                    // Обработка кнопки "Подробнее"
                    const watchBtn = section.querySelector(`#watch-${flower.id}`) as HTMLInputElement | null;
                    if (watchBtn) {
                        watchBtn.addEventListener('click', (): void => {
                            window.location.href = `/flower.html?id=${flower.id}`; 
                        });
                    }

                    catalogContainer.appendChild(section);
                });
            } else {
                catalogContainer.innerHTML = '<div class="no-products">Товары временно отсутствуют</div>';
            }

            // Перерисовываем кнопки пагинации (передаем из вашего ApiResponse поле pages)
            if (data.pages) {
                renderPagination(data.pages, page);
            }
        })
        .catch((err: any) => console.error('Ошибка fetch каталога:', err)); // ИСПРАВЛЕНО: закрыли цепочку fetch
    }

    // ИСПРАВЛЕНО: Добавлена функция отрисовки кнопок страниц
    function renderPagination(totalPages: number, activePage: number): void {
        const paginationContainer = document.getElementById('pagination-container') as HTMLElement | null;
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.innerText = String(i);
            pageBtn.className = 'pagination-btn';

            if (i === activePage) {
                pageBtn.classList.add('active');
            }

            pageBtn.addEventListener('click', (event: Event): void => {
                currentPage = i;
                loadCatalog(currentPage, currentVidId);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // плавный скролл наверх
            });

            paginationContainer.appendChild(pageBtn);
        }
    }

    // Стартовая загрузка каталога
    loadCatalog(currentPage, currentVidId);
});

async function vidOne(id: string, num: number): Promise<void> {
    const allTitleGoods = document.getElementsByClassName('title_goods') as HTMLCollectionOf<Element>;
    fetch(`/api/vid/getOne/${id}`, {
        method: "GET",
        headers: { "content-Type": "application/json" },
    })
    .then((response) => response.json())
    .then((data: ApiResponse & Partial<VidAttributes>) => {
        if (data.mes || data.message) {
            console.log(data.mes || data.message);
        } else if (data['name']) {
            if (allTitleGoods[num]) (allTitleGoods[num] as HTMLElement).innerHTML = String(data['name']);
        }  
    });
}

async function imgOne(id: string, num: number): Promise<void> {
    const allimg = document.querySelectorAll('.imgs_goods > img') as NodeListOf<Element>;
    fetch(`/api/imgs/getAll?flowerId=${id}`, {
        method: "GET",
        headers: { "content-Type": "application/json" }
    })
    .then((response) => response.json())
    // СУРОВО: строгий тип для картинок
    .then((data: ApiResponse<FlowerImgsAttributes>) => {
        if (data.mes || data.message) {
            console.log(data.mes || data.message);
        } else if (data.rows && data.rows.length > 0) {
            // Больше никакого any, строго берем свойство .img из FlowerImgsAttributes
            let path = String('/imgStoreMINI/' + data.rows[0].img);
            if (allimg && allimg[num]) (allimg[num] as HTMLImageElement).src = path;
        }  
    });    
}

function oneItem(event: Event): void {
    // СУРОВО: Использован currentTarget для защиты от промаха мимо ID кнопки
    if (event && event.currentTarget) {   
        const clickedElement = event.currentTarget as HTMLElement;
        window.location.href = '/flower.html?id=' + clickedElement.id; 
    } else {
        window.location.href = '/';
    }
}