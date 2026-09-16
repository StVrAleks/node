async function loadUserOrders(): Promise<void> {
    const container = document.getElementById('orders-rows-container');
    const mistakeEl = document.getElementById('cabinet-error-msg');
    if (!container) return;

    container.innerHTML = '<tr><td colspan="4">Загрузка данных...</td></tr>';
    const localToken = localStorage.getItem('floweridaKey');

    try {
        const response = await fetch('/api/orders/my-orders', { // Роут можно оставить таким или переименовать
            method: "GET",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${localToken}` 
            }
        });

        const data = await response.json();

        // ИСПРАВЛЕНО под ваш обработчик ошибок
        if (data.mes || data.message) {
            if (mistakeEl) mistakeEl.innerHTML = String(data.mes || data.message);
            container.innerHTML = '<tr><td colspan="4" style="color:red;">Ошибка доступа</td></tr>';
            return;
        }

        container.innerHTML = '';

        if (!data.rows || data.rows.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Ваша история пуста.</td></tr>';
            return;
        }

        data.rows.forEach((item: any, index: number) => {
            const num = index + 1;
            const flowerName = item.Flower?.name || 'Цветок';
            const flowerPrice = Number(item.Flower?.price || 0);
            const quantity = Number(item.quantity || 1);
            const totalItemPrice = (flowerPrice * quantity).toFixed(2);

            // 1. Компактная главная строка
            const trSummary = document.createElement('tr');
            trSummary.className = 'order-summary-row';
            trSummary.id = `basket-item-row-${num}`;
            trSummary.innerHTML = `
                <td>${flowerName}</td>
                <td>${quantity} шт.</td>
                <td>${flowerPrice.toFixed(2)} BYN</td>
                <td><span class="status-badge status--done">В корзине</span></td>
            `;
            container.appendChild(trSummary);

            // 2. Скрытые детали (аккордеон)
            const trDetails = document.createElement('tr');
            trDetails.className = 'order-details-row';
            trDetails.id = `basket-details-${num}`;
            trDetails.style.display = 'none';
            trDetails.innerHTML = `
                <td colspan="4">
                    <div class="order-details-content">
                        <p><strong>Наименование товара:</strong> ${flowerName}</p>
                        <p><strong>Стоимость за позицию:</strong> ${totalItemPrice} BYN</p>
                    </div>
                </td>
            `;
            container.appendChild(trDetails);

            // 3. Переключение кликом
            trSummary.addEventListener('click', () => {
                const isHidden = trDetails.style.display === 'none';
                document.querySelectorAll('.order-details-row').forEach((el: any) => el.style.display = 'none');
                trDetails.style.display = isHidden ? 'table-row' : 'none';
            });
        });

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<tr><td colspan="4" style="color:red;">Ошибка соединения</td></tr>';
    }
}