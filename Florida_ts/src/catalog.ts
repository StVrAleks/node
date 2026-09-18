import { ApiResponse, FlowerImgsAttributes, FlowerAttributes } from './types.js';

interface IFlowerWithImages extends FlowerAttributes {
    flower_imgs?: FlowerImgsAttributes[];
    imgs?: FlowerImgsAttributes[];
}

document.addEventListener('DOMContentLoaded', (): void => {
    let currentPage: number = 1;
    const itemsPerPage: number = 9; 

    // Первичный запуск каталога
    loadCatalog(currentPage);

    function loadCatalog(page: number): void {
        const url = `/api/flower/getAll?page=${page}&limit=${itemsPerPage}`;

        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
        .then((response) => response.json())
        .then((data: ApiResponse<IFlowerWithImages>) => {
            
            const mist = document.getElementById('mist10') as HTMLElement | null;
            if (data.mes || data.message) {
                if (mist) mist.innerHTML = data.mes || data.message || 'Ошибка загрузки';
                return;
            }

            const catalogContainer = document.getElementById('catalog-products') as HTMLElement | null;
            if (!catalogContainer) return;
            
            catalogContainer.innerHTML = ''; // Очищаем сетку

            if (data.rows && data.rows.length > 0) {
                data.rows.forEach((flower: IFlowerWithImages) => {
                    
                    let mainImgPath: string = 'default.jpg'; 
                    const flowerImages = flower.flower_imgs || flower.imgs; 
                    
                    if (flowerImages && flowerImages.length > 0) {
                        const mainImageObject = flowerImages.find((img: FlowerImgsAttributes) => Number(img.num) === 1);
                        mainImgPath = mainImageObject ? mainImageObject.img : flowerImages[0].img;
                    }

                    const section = document.createElement('section');
                    section.className = 'conteiner_section';

                    section.innerHTML = `
                        <div class="card">
                            <div class="card__top">
                                <h2 class="title_goods">${flower.name}</h2>
                                <div class="imgs_goods">
                                    <img src="/imgStoreMINI/${mainImgPath}" alt="${flower.name}">
                                </div>
                            </div>
                            <div class="card__botoom">
                                <div class="full_title" data-id="${flower.id}">${flower.name}</div>
                                <div class="price">${Number(flower.price).toFixed(2)} BYN</div>
                                <div class="descriptionId">${flower.mDescript || ''}</div>
                            </div>
                            <div class="card_control" style="display: flex; align-items: center; gap: 10px; padding: 10px;">
                                <input type="button" value="Купить" class="cardGood class_control_button" data-id="${flower.id}" style="background-color: #181d19; color: white;">
                                
                                <input type="button" class="watch class_control_button" id="watch-${flower.id}" data-id="${flower.id}" value="Подробнее" style="background-color: #4caf50; color: white;">
                                <input type="button" value="❤" class="like_good wishGood class_control_button" data-id="${flower.id}" style="background-color: #900; color: white;">
                            </div>
                        </div>
                    `;
                    catalogContainer.appendChild(section);

                    // ИСПРАВЛЕНО: Активируем кнопку "Подробнее" для перехода на карточку букета
                    document.getElementById(`watch-${flower.id}`)?.addEventListener('click', () => {
                        window.location.href = `/flower?id=${flower.id}`;
                    });

                    // Слушатель для кнопки "Купить" (в будущую корзину)
                    section.querySelector('.cardGood')?.addEventListener('click', () => {
                        addToBasket(flower.id);
                    });

                    // Слушатель для кнопки "Лайк" (в Избранное)
                    section.querySelector('.wishGood')?.addEventListener('click', () => {
                        toggleFavorite(flower.id);
                    });
                });

                // Рендерим кнопки пагинации на основе общего count из БД
                renderPagination(data.total || 0, page);
            } else {
                catalogContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Цветы не найдены</p>';
            }
        })
        .catch((error) => console.error('Ошибка каталога:', error));
    }

    /**
     * Динамическая пагинация под стили catalog.hbs
     */
    function renderPagination(totalCount: number, page: number): void {
        const pagContainer = document.getElementById('pagination-container');
        if (!pagContainer) return;
        pagContainer.innerHTML = '';

        const totalPages = Math.ceil(totalCount / itemsPerPage);
        if (totalPages <= 1) return; // Если страниц меньше двух, пагинацию не рисуем

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${i === page ? 'active' : ''}`;
            btn.textContent = String(i);
            
            if (i !== page) {
                btn.addEventListener('click', () => {
                    currentPage = i;
                    loadCatalog(currentPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Бережный скролл вверх
                });
            }
            pagContainer.appendChild(btn);
        }
    }

    /**
     * Добавление в корзину (через автоматические Куки)
     */
    async function addToBasket(flowerId: number): Promise<void> {
        try {
            const response = await fetch('/api/basket/add', { // Проверьте этот роут на бэкенде
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flowerId, quantity: 1 })
            });
            const data = await response.json();
            if (data.change === 'ok' || !data.mes) {
                alert('Товар успешно добавлен в корзину!');
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Переключение лайка в избранном (через автоматические Куки)
     */
    async function toggleFavorite(flowerId: number): Promise<void> {
        try {
            const response = await fetch('/api/favorites/toggle', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flowerId })
            });
            const data = await response.json();
            if (data.change === 'ok' || !data.mes) {
                alert('Список избранного обновлен!');
            }
        } catch (e) {
            console.error(e);
        }
    }
});