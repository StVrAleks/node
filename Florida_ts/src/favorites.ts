import { ApiResponse } from './types.js';

let favCurrentPage: number = 1;
const favItemsPerPage: number = 9;

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('favorites-products-grid')) {
        loadFavoritesPage(favCurrentPage);
        initFavoritesPagination();
    }
});

function initFavoritesPagination(): void {
    const preBtn = document.getElementById('pre-fav');
    const nextBtn = document.getElementById('next-fav');

    preBtn?.addEventListener('click', () => {
        if (favCurrentPage > 1) {
            favCurrentPage--;
            loadFavoritesPage(favCurrentPage);
        }
    });

    nextBtn?.addEventListener('click', () => {
        favCurrentPage++;
        loadFavoritesPage(favCurrentPage);
    });
}

async function loadFavoritesPage(page: number): Promise<void> {
    const grid = document.getElementById('favorites-products-grid');
    const pageInput = document.getElementById('numPage-fav') as HTMLInputElement | null;
    const mistakeEl = document.getElementById('favorites-error-msg');

    if (!grid) return;
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Загрузка любимых товаров...</p>';
    if (mistakeEl) mistakeEl.innerHTML = '';

    try {
        const response = await fetch(`/api/favorites/getAll?page=${page}&limit=${favItemsPerPage}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" } // Authorization УДАЛЕН
        });

        const data = await response.json();

        if (data.mes || data.message) {
            if (mistakeEl) mistakeEl.innerHTML = String(data.mes || data.message);
            grid.innerHTML = '';
            return;
        }

        if (data.rows.length === 0 && page > 1) {
            favCurrentPage--;
            loadFavoritesPage(favCurrentPage);
            return;
        }

        grid.innerHTML = '';
 console.log('data.rows ', data.rows);
        if (!data.rows || data.rows.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px;">Список избранного пуст. Нажмите сердечко на карточках товаров в каталоге!</p>';
            if (pageInput) pageInput.value = '1';
            return;
        }

        if (pageInput) pageInput.value = String(page);

        data.rows.forEach((favItem: any) => {
            const flower = favItem.flower;
            if (!flower) return;

            const mainImg = flower.flower_imgs && flower.flower_imgs.length > 0 
                ? flower.flower_imgs[0].img 
                : 'default-flower.jpg';

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-card__image-wrapper">
                    <img src="/imgStoreMINI/${mainImg}" alt="${flower.name}" class="product-card__img">
                </div>
                <div class="product-card__info">
                    <h4 class="product-card__title">${flower.name}</h4>
                    <p class="product-card__price">${Number(flower.price).toFixed(2)} BYN</p>
                    <div class="product-card__actions" style="margin-top: 10px; display: flex; gap: 10px;">
                        <!-- ИСПРАВЛЕНО: роут приведен в строгое соответствие с вашим viewRouter.ts -->
                        <a href="/flower?id=${flower.id}" class="class_control_button" style="text-decoration:none; text-align:center; background-color:#181d19; color:white; font-size:12px; padding: 5px 10px;">Подробнее</a>
                        <input type="button" class="class_control_button remove-fav-btn" value="✕" data-flower-id="${flower.id}" style="background-color:#900; color:white; padding: 5px 10px;" title="Удалить из избранного">
                    </div>
                </div>
            `;
            grid.appendChild(card);

            card.querySelector('.remove-fav-btn')?.addEventListener('click', (e) => {
                const btn = e.target as HTMLInputElement;
                const flowerId = btn.getAttribute('data-flower-id');
                if (flowerId) removeLikeGroup(parseInt(flowerId));
            });
        });

    } catch (error) {
        console.error('Ошибка пагинации избранного:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:red;">Ошибка соединения с сервером</p>';
    }
}

async function removeLikeGroup(flowerId: number): Promise<void> {
    try {
        await fetch('/api/favorites/toggle', {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Authorization УДАЛЕН
            body: JSON.stringify({ flowerId })
        });
        loadFavoritesPage(favCurrentPage);
    } catch (err) {
        console.error('Ошибка при удалении лайка:', err);
    }
}