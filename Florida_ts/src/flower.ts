import { ApiResponse, FlowerAttributes } from './types.js';

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
    // ИСПРАВЛЕНО: Безопасно забираем ID товара через data-атрибут обертки!
    const wrapper = document.querySelector('.product-page-wrapper') as HTMLElement | null;
    const idFl = wrapper ? wrapper.dataset.flowerId : null;

    if (!idFl) {
        console.error('Критическая ошибка: ID цветка не найден в разметке.');
        return;
    }

    // Запускаем параллельную загрузку всех данных карточки товара
    await Promise.all([
        loadMainFlowerData(idFl),
        loadFlowerImages(idFl),
        loadFlowerDescription(idFl)
    ]);

    // Инициализируем селектор количества
    initQuantitySelector();

    // Настраиваем клик кнопок
    initActionButtons(Number(idFl));
});

/* Загрузка данных цветка */
async function loadMainFlowerData(idFl: string): Promise<void> {
    try {
        const response = await fetch(`/api/flower/getOne/${idFl}`, { method: "GET" });
        const data = await response.json();

        if (data.mes || data.message) return;

        setTextById('flStatus', data.status);
        setTextById('vidFl', data.flower_vid?.name);
        setTextById('titleFl', data.name);
        setTextById('priceFl', Number(data.price).toFixed(2));

    } catch (err) { console.error(err); }
}

/* Загрузка изображений */
async function loadFlowerImages(idFl: string): Promise<void> {
    const divImg = document.getElementById('imgsFl');
    if (!divImg) return;

    try {
        const response = await fetch(`/api/imgs/getAll/${idFl}`, { method: "GET" });
        const data = await response.json();

        if (data.rows && data.rows.length > 0) {
            data.rows.forEach((row: any) => {
                const img = document.createElement("img");  
                img.src = `/imgStore/${row.img}`;
                img.alt = "Фото букета";
                divImg.appendChild(img);
            });
        }
    } catch (err) { console.error(err); }
}

/* Загрузка описания */
async function loadFlowerDescription(idFl: string): Promise<void> {
    const descrContainer = document.getElementById('descr');
    if (!descrContainer) return;

    try {
        const response = await fetch(`/api/info/getOne/${idFl}`, { method: "GET" });
        const data = await response.json();

        console.log('=== ДАННЫЕ ОПИСАНИЯ НА ФРОНТЕ ===', data);

        // Проверяем, что пришел не пустой объект и в нем есть хоть какие-то данные
        if (data && (data.description || data.title)) {
            
            // 1. Создаем заголовок описания (если в БД пусто — пишем дефолтное "О букете")
            const divTitle = document.createElement("div");  
            divTitle.innerHTML = data.title && data.title.trim() !== "" ? data.title : "Характеристики букета";
            divTitle.className = 'descrStyle';

            // 2. Создаем блок самого текста описания
            const divDesc = document.createElement("div");  
            divDesc.innerHTML = data.description && data.description.trim() !== "" 
                ? data.description 
                : "Текстовое описание для данного товара временно отсутствует.";
            divDesc.style.paddingBottom = '25px';
            divDesc.style.lineHeight = '1.6';
            divDesc.style.color = '#444';

            // Очищаем контейнер перед добавлением (на случай повторных вызовов)
            descrContainer.innerHTML = '';
            
            // Вставляем элементы в DOM
            descrContainer.appendChild(divTitle);   
            descrContainer.appendChild(divDesc);                         
        } else {
            // Если бэк вернул пустоту или ошибку 404
            descrContainer.innerHTML = '<p style="color: #666; font-style: italic;">Описание к этому товару еще не добавлено.</p>';
        }
    } catch (err) {
        console.error('Ошибка при получении описания товара на фронтенде:', err);
        descrContainer.innerHTML = '<p style="color: red;">Не удалось загрузить описание товара.</p>';
    }
}

/* Логика изменения количества (+ / -) */
function initQuantitySelector(): void {
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');
    const qtyInput = document.getElementById('product-qty') as HTMLInputElement | null;

    if (!qtyInput) return;

    minusBtn?.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = String(val - 1);
    });

    plusBtn?.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = String(val + 1);
    });
}

/* Управление кнопками Корзины и Избранного */
function initActionButtons(flowerId: number): void {
    const cartBtn = document.getElementById('add-to-cart-btn');
    const favBtn = document.getElementById('fav-toggle-btn');

    // Клик по кнопке "В корзину"
    cartBtn?.addEventListener('click', async () => {
        const qtyInput = document.getElementById('product-qty') as HTMLInputElement | null;
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

        try {
            const response = await fetch('/api/basket/add', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flowerId, quantity })
            });
            const data = await response.json();
            if (data.change === 'ok' || !data.mes) {
                // Визуально меняем статус кнопки
                cartBtn.classList.add('in-cart');
                const btnText = cartBtn.querySelector('.btn-text');
                if (btnText) btnText.innerHTML = '✓ Добавлено';
                alert('Товар успешно добавлен в корзину!');
            }
        } catch (e) { console.error(e); }
    });

    // Клик по кнопке "Избранное" (Лайк)
    favBtn?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/favorites/toggle', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flowerId })
            });
            const data = await response.json();
            if (data.change === 'ok') {
                // Переключаем активное состояние сердечка на основе ответа бэкенда
                if (data.isFavorite) {
                    favBtn.classList.add('active');
                } else {
                    favBtn.classList.remove('active');
                }
            }
        } catch (e) { console.error(e); }
    });
}

function setTextById(id: string, value: any): void {
    const element = document.getElementById(id);
    if (element) element.innerHTML = value !== undefined && value !== null ? String(value) : '';
}