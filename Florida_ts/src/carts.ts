import { ApiResponse } from './types.js';

document.addEventListener('DOMContentLoaded', () => {
    // Подстраховка на случай, если гость умудрился зайти в корзину
    if (!document.cookie.includes('floweridaKey')) {
        window.location.href = '/login';
        return;
    }

    // 1. Автоматически предзаполняем поля формы из профиля пользователя
    autoFillContactInfo();

    // 2. Слушаем отправку формы оформления заказа
    const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement | null;
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleOrderCheckout);
    }
});

/**
 * Функция автозаполнения полей телефона и адреса на основе данных профиля
 */
async function autoFillContactInfo(): Promise<void> {
    try {
        // Делаем запрос к эндпоинту проверки авторизации / текущего юзера
        // Заголовок Authorization УДАЛЕН — куки подставятся автоматически
        const response = await fetch('/api/user/auth', {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();

        // Если данные успешно получены, подставляем их в инпуты формы корзины
        if (data && !data.mes && !data.message) {
            const phoneInput = document.getElementById('cart-phone') as HTMLInputElement | null;
            const addressInput = document.getElementById('cart-address') as HTMLInputElement | null;

            if (phoneInput && data.phone) phoneInput.value = data.phone;
            if (addressInput && data.address) addressInput.value = data.address;
        }
    } catch (error) {
        console.error('Ошибка при автоматическом получении профиля для корзины:', error);
    }
}

/**
 * Обработчик отправки формы и создания заказа в MySQL
 */
async function handleOrderCheckout(event: Event): Promise<void> {
    event.preventDefault(); // Блокируем стандартную перезагрузку страницы формой

    const mistakeEl = document.getElementById('cart-error-msg') as HTMLElement | null;
    if (mistakeEl) mistakeEl.innerHTML = '';

    const phoneInput = document.getElementById('cart-phone') as HTMLInputElement | null;
    const addressInput = document.getElementById('cart-address') as HTMLInputElement | null;

    if (!phoneInput || !addressInput) return;

    const phoneVal = phoneInput.value.trim();
    const addressVal = addressInput.value.trim();

    // Валидация на фронтенде перед отправкой группового запроса
    if (!phoneVal || !addressVal) {
        if (mistakeEl) mistakeEl.innerHTML = 'Пожалуйста, заполните контактный телефон и адрес доставки в г. Могилев!';
        return;
    }

    try {
        // Блокируем кнопку отправки, чтобы пользователь не нажал её дважды
        const submitBtn = document.getElementById('checkout-submit-btn') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = true;

        const response = await fetch('/api/order/create', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
                // Заголовок Authorization УДАЛЕН
            },
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
        const mistakeEl = document.getElementById('cart-error-msg') as HTMLElement | null;
        if (mistakeEl) mistakeEl.innerHTML = 'Ошибка соединения с сервером. Попробуйте позже.';
        
        const submitBtn = document.getElementById('checkout-submit-btn') as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = false;
    }
}