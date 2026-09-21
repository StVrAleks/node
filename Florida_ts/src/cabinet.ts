import { ApiResponse, OrderAttributes, OrderFlowerAttributes } from './types.js';

// Расширяем тип для прилетающих с бэкенда данных (с учетом инклудов)
interface OrderFlowerWithDetails extends OrderFlowerAttributes {
    flower?: {
        name: string;
    };
}

interface OrderWithItems extends OrderAttributes {
    order_flowers?: OrderFlowerWithDetails[];
}

document.addEventListener('DOMContentLoaded', () => {
 const hasCookie = document.cookie.includes('floweridaKey');
    if (!hasCookie) {
        window.location.href = '/login';
        return;
    }

    // Инициализируем табы личного кабинета
    initCabinetTabs();

    // Слушаем кнопку сохранения профиля
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', updateCabinetProfile);
    }
});

/**
 * 1. Логика переключения вкладок (Аналогично вашей админке)
 */
function initCabinetTabs(): void {
    const tabProfile = document.getElementById('tab-profile');
    const tabOrders = document.getElementById('tab-orders');
    const tabSecurity = document.getElementById('tab-security');

    const secProfile = document.getElementById('sec-profile');
    const secOrders = document.getElementById('sec-orders');
    const secSecurity = document.getElementById('sec-security');

    const tabs = [tabProfile, tabOrders, tabSecurity];
    const sections = [secProfile, secOrders, secSecurity];

    tabs.forEach((tab, index) => {
        if (!tab) return;
        tab.addEventListener('click', () => {
            // Сбрасываем активные классы у кнопок
            tabs.forEach(t => t?.classList.remove('cabinet-menu__btn--active'));
            // Прячем все секции
            sections.forEach(s => { if (s) s.style.display = 'none'; });

            // Активируем текущую кнопку и секцию
            tab.classList.add('cabinet-menu__btn--active');
            if (sections[index]) sections[index]!.style.display = 'block';

            // Если кликнули на вкладку заказов — подгружаем их с бэкенда
            if (tab === tabOrders) {
                loadUserOrders();
            }
        });
    });
}

/**
 * 2. Загрузка и рендеринг компактной истории заказов (Аккордеон)
 */
async function loadUserOrders(): Promise<void> {
    const container = document.getElementById('orders-rows-container');
    const mistakeEl = document.getElementById('cabinet-error-msg');
    if (!container) return;

    container.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">Загрузка истории покупок...</td></tr>';
    if (mistakeEl) mistakeEl.innerHTML = '';

    //const localToken = localStorage.getItem('floweridaKey');

    try {
        const response = await fetch('/api/order/my-orders', {
            method: "GET",
            headers: { 
                "Content-Type": "application/json", 
            }
        });

        const data: any = await response.json();

        // Проверка ошибок в стиле вашего проекта
        if (data.mes || data.message) {
            if (mistakeEl) mistakeEl.innerHTML = String(data.mes || data.message);
            container.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Ошибка доступа</td></tr>';
            return;
        }

        container.innerHTML = ''; // Очищаем заглушку загрузки

        if (!data.rows || data.rows.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">У вас пока нет оформленных заказов.</td></tr>';
            return;
        }

        // Рендерим заказы из новых таблиц Order / OrderFlower
        data.rows.forEach((order: OrderWithItems, index: number) => {
            const num = index + 1;
            // Форматируем дату создания заказа
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '—';
            
            // Собираем лаконичную строку состава букета из OrderFlower
            const itemsDescription = order.order_flowers?.map((item) => {
                const name = item.flower?.name || 'Цветок';
                return `${name} (${item.quantity} шт. х ${Number(item.price).toFixed(2)} BYN)`;
            }).join(', ') || 'Состав заказа пуст';

            // Создаем основную сводную строку (Сумма зафиксирована в totalPrice)
            const trSummary = document.createElement('tr');
            trSummary.className = 'order-summary-row';
            trSummary.innerHTML = `
                <td>#${order.id}</td>
                <td>${orderDate}</td>
                <td>${Number(order.totalPrice).toFixed(2)} BYN</td>
                <td><span class="status-badge status--${order.status === 'Доставлено' ? 'done' : 'delivery'}">${order.status}</span></td>
            `;
            container.appendChild(trSummary);

            // Создаем скрытую подстроку с деталями доставки в Могилеве и составом
            const trDetails = document.createElement('tr');
            trDetails.className = 'order-details-row';
            trDetails.style.display = 'none'; // Изначально скрыта
            trDetails.innerHTML = `
                <td colspan="4">
                    <div class="order-details-content">
                        <p><strong>Состав букета:</strong> ${itemsDescription}</p>
                        <p><strong>Контактный телефон:</strong> ${order.phone}</p>
                        <p><strong>Адрес доставки:</strong> ${order.address}</p>
                    </div>
                </td>
            `;
            container.appendChild(trDetails);

            // Логика аккордеона: клик по строке раскрывает детали именно этого заказа
            trSummary.addEventListener('click', () => {
                const isHidden = trDetails.style.display === 'none';
                
                // Прячем все остальные открытые детали для сохранения компактности
                document.querySelectorAll('.order-details-row').forEach((el: any) => {
                    el.style.display = 'none';
                });

                // Переключаем текущую строку
                trDetails.style.display = isHidden ? 'table-row' : 'none';
            });
        });

    } catch (error: any) {
        console.error('Ошибка загрузки заказов:', error);
        container.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Ошибка соединения с сервером</td></tr>';
    }
}

/**
 * 3. Сохранение изменений профиля (Имя, Телефон, Адрес)
 */
async function updateCabinetProfile(): Promise<void> {
    const mistakeEl = document.getElementById('cabinet-error-msg');
    if (mistakeEl) mistakeEl.innerHTML = '';

    const nameVal = (document.getElementById('user-name') as HTMLInputElement).value.trim();
    const phoneVal = (document.getElementById('user-phone') as HTMLInputElement).value.trim();
    const addressVal = (document.getElementById('user-address') as HTMLInputElement).value.trim();
    const emailVal = (document.getElementById('user-email') as HTMLInputElement).value.trim();

    if (!nameVal || !emailVal) {
        if (mistakeEl) mistakeEl.innerHTML = 'Поле "Ваше имя" или "Ваша почта" обязательно для заполнения';
        return;
    }

    try {
const response = await fetch('/api/user/updateProfile', { 
    method: "PUT", // Метод PUT, как у вас и настроено на бэкенде
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        emailField: emailVal,
        name: nameVal,
        phone: phoneVal,
        address: addressVal
    })
});
        const data = await response.json();
        if (data.change === 'ok') {
            alert('Данные вашего профиля успешно сохранены!');
        } else if (mistakeEl) {
            mistakeEl.innerHTML = data.mes || data.message || 'Не удалось обновить профиль';
        }
    } catch (error: any) {
        console.error('Ошибка обновления профиля:', error);
        if (mistakeEl) mistakeEl.innerHTML = 'Ошибка сети при сохранении изменений';
    }
}