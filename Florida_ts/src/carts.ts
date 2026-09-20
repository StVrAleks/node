import { ApiResponse } from './types.js';

document.addEventListener('DOMContentLoaded', async () => {

     await loadAndFillCart();
    // 2. Слушаем отправку формы оформления заказа
    const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement | null;
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleOrderCheckout);
    }
});

/**
 * Функция автозаполнения полей телефона и адреса на основе данных профиля
 */
async function loadAndFillCart(): Promise<void> {
    const grid = document.getElementById('cart-products-grid');
    const mistakeEl = document.getElementById('cart-error-msg');   
    const contentWrapper = document.getElementById('cart-content-wrapper');
    const totalBox = document.getElementById('total-box');
    const totalSumEl = document.getElementById('cart-final-total-price');

    if (!grid) return;
    grid.innerHTML = '<p style="text-align: center; padding: 20px;">Загрузка товаров корзины...</p>';
    if (mistakeEl) mistakeEl.innerHTML = '';

    try {
        // Делаем GET-запрос к вашему контроллеру /api/basket/cart
        const response = await fetch('/api/basketUser/cart', {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        // Если бэкенд вернул 403 Forbidden (Вы забыли авторизоваться!)
        if (response.status === 403) {
            const errData = await response.json();
            if (mistakeEl) mistakeEl.innerHTML = errData.mes || 'Вы забыли авторизоваться!';
            if (contentWrapper) contentWrapper.style.display = 'none';
            grid.innerHTML = '';
            return;
        }

        const result = await response.json();
        
        // Извлекаем данные из нового комбинированного ответа бэкенда
        const basketFlowers = result.basketFlowers || [];
        const profile = result.userProfile;

        // 1. АВТОЗАПОЛНЕНИЕ ПРОФИЛЯ (Телефон и Адрес в г. Могилев)
        if (profile) {
            const phoneInput = document.getElementById('cart-phone') as HTMLInputElement | null;
            const addressInput = document.getElementById('cart-address') as HTMLInputElement | null;
            
            if (phoneInput && profile.phone) phoneInput.value = profile.phone;
            if (addressInput && profile.address) addressInput.value = profile.address;
        }

        grid.innerHTML = '';

        // Если корзина пуста
        if (!basketFlowers || basketFlowers.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 40px 0; color: #666;">Ваша корзина пуста. Перейдите в каталог за букетами!</p>';
            if (totalBox) totalBox.style.display = 'none';
            const checkoutForm = document.getElementById('checkout-form');
            if (checkoutForm) (checkoutForm as HTMLElement).style.display = 'none';
            return;
        }

        // Включаем видимость формы и итогового блока
        if (totalBox) totalBox.style.display = 'block';
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) (checkoutForm as HTMLElement).style.display = 'block';

        // 2. ДИНАМИЧЕСКИЙ РЕНДЕРИНГ СТРОК ТОВАРОВ
        let finalTotalPrice = 0;

        basketFlowers.forEach((item: any) => {
            const flower = item.flower;
            if (!flower) return;

            // Вычисляем сумму позиции и прибавляем к общей
            const itemPrice = Number(flower.price);
            const itemQty = Number(item.quantity);
            finalTotalPrice += itemPrice * itemQty;

            // Извлекаем первую мини-картинку из связи flower_imgs
            const mainImg = flower.flower_imgs && flower.flower_imgs.length > 0 
                ? flower.flower_imgs[0].img 
                : 'default-flower.jpg';

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; gap: 15px;';
            
            row.innerHTML = `
                <div style="width: 70px; height: 70px; flex-shrink: 0; overflow: hidden; border-radius: 4px;">
                    <img src="/imgStoreMINI/${mainImg}" alt="${flower.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; font-size: 16px;">${flower.name}</h4>
                </div>
                <div style="flex-shrink: 0; text-align: right; min-width: 90px;">
                    <span style="font-weight: bold;">${itemPrice.toFixed(2)} BYN</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="number" 
                           class="order-item-count" 
                           value="${itemQty}" 
                           min="1" 
                           max="99" 
                           data-flower-id="${flower.id}"
                           style="width: 50px; text-align: center; border: 1px solid #ccc; padding: 5px; border-radius: 4px;">
                </div>
                <button type="button" class="delete-cart-item-btn" data-flower-id="${flower.id}" style="background: none; border: none; color: #900; cursor: pointer; font-size: 18px; padding: 0 5px;">✕</button>
            `;
            grid.appendChild(row);

            // 3. НАВЕШИВАЕМ СОБЫТИЕ УДАЛЕНИЯ ПОЗИЦИИ КРЕСТИКОМ ✕ [Query-relevant Context]
            const deleteBtn = row.querySelector('.delete-cart-item-btn');
            deleteBtn?.addEventListener('click', async (e: Event) => {
                const target = e.currentTarget as HTMLButtonElement;
                const fId = target.getAttribute('data-flower-id');
                if (fId) await deleteItemFromCart(Number(fId));
            });
        });

        // Обновляем итоговую сумму всей корзины на фронтенде
        if (totalSumEl) totalSumEl.innerHTML = finalTotalPrice.toFixed(2);

    } catch (error) {
        console.error('Ошибка рендеринга корзины:', error);
        if (mistakeEl) mistakeEl.innerHTML = 'Ошибка соединения с сервером при получении корзины.';
    }
}

/**
 * Логика удаления одной конкретной позиции из промежуточной таблицы БД
 */
async function deleteItemFromCart(flowerId: number): Promise<void> {
    try {
        const response = await fetch('/api/basketUser/deleteItem', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flowerId })
        });

        const resData = await response.json();
        if (resData.change === 'ok') {
            // Мгновенно перерисовываем корзину без перезагрузки вкладки браузера [Query-relevant Context]!
            await loadAndFillCart(); 
        } else {
            alert(resData.message || 'Не удалось удалить выбранный товар.');
        }
    } catch (err) {
        console.error('Ошибка запроса удаления позиции:', err);
    }
}

/**
 * Обработчик отправки формы и создания заказа в MySQL
 */
async function handleOrderCheckout(event: Event): Promise<void> {
    event.preventDefault(); 

    const mistakeEl = document.getElementById('cart-error-msg') as HTMLElement | null;
    if (mistakeEl) mistakeEl.innerHTML = '';

    const phoneInput = document.getElementById('cart-phone') as HTMLInputElement | null;
    const addressInput = document.getElementById('cart-address') as HTMLInputElement | null;

    if (!phoneInput || !addressInput) return;

    const phoneVal = phoneInput.value.trim();
    const addressVal = addressInput.value.trim();

    if (!phoneVal || !addressVal) {
        if (mistakeEl) mistakeEl.innerHTML = 'Пожалуйста, заполните контактный телефон и адрес доставки в г. Могилев!';
        return;
    }

    try {
        const submitBtn = document.getElementById('checkout-submit-btn') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = true;

        const response = await fetch('/api/order/create', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: phoneVal,
                address: addressVal
            })
        });

        const data = await response.json();

        if (data.change === 'ok') {
            alert(`Заказ успешно оформлен! Номер вашего заказа: #${data.orderId}`);
            window.location.href = '/cabinet'; 
        } else {
            if (submitBtn) submitBtn.disabled = false;
            if (mistakeEl) mistakeEl.innerHTML = data.mes || data.message || 'Произошла ошибка при оформлении заказа';
        }
    } catch (error: any) {
        console.error('Критическая ошибка при отправке заказа:', error);
        if (mistakeEl) mistakeEl.innerHTML = 'Ошибка соединения с сервером. Попробуйте позже.';
        
        const submitBtn = document.getElementById('checkout-submit-btn') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = false;
    }
}