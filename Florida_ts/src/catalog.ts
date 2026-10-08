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
    const url = `/api/favorites/getAllCategory?page=${page}&limit=${itemsPerPage}`;

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
            data.rows.forEach((flower: any) => {
                const flowerImages = flower.flower_imgs; 
                console.log('flowerImages ', flower);
                const favoritaStyle : string = flower.isFavorite ? 'active' : '';
                const flowerNameImg = flowerImages[0]?.img || 'default.jpg';
                const section = document.createElement('section');
                section.className = 'conteiner_section';

                section.innerHTML = `
                    <div class="card">
                        <div class="card__top">
                            <h2 class="title_goods">${flower.flower_vid?.name}</h2>
                            <div class="imgs_goods">
                                <img src="/imgStoreMINI/${flowerNameImg}" alt="${flower.name}">
                            </div>
                        </div>
                        <div class="card__botoom">
                            <div class="full_title" data-id="${flower.id}">${flower.name}</div>
                            <div class="price">${Number(flower.price).toFixed(2)} BYN</div>
                        </div>
                        <div class="card_control" style="display: flex; align-items: center; gap: 10px; padding: 10px;">                          
                            <button type="button" class="cardGood class_control_button icon icon-cart .btn-cart.in-cart" data-id="${flower.id}" title="Купить">
                                <svg class="icon icon-catalog-cart" width="20" height="20">
                                    <use xlink:href="#icon-cart" href="#icon-cart"></use>
                                </svg>
                            </button>

                            <button type="button" class="watch class_control_button icon icon-btn" id="watch-${flower.id}" data-id="${flower.id}" title="Подробнее">
                                <svg class="icon icon-catalog-watch" width="20" height="20">
                                    <use xlink:href="#icon-eye" href="#icon-eye"></use>
                                </svg>
                            </button>                           
                           
                            <button type="button" class="like_good ${favoritaStyle} wishGood class_control_button icon icon-wishlist" data-id="${flower.id}" title="Добавить в избранное">
                                <svg class="icon icon-catalog-heart" width="18" height="20">
                                    <use href="#icon-favorites"></use>
                                </svg>
                            </button>    
                        </div>
                    </div>
                `;
                catalogContainer.appendChild(section);
                // Активируем кнопку "Подробнее"
                document.getElementById(`watch-${flower.id}`)?.addEventListener('click', () => {
                    window.location.href = `/flower?id=${flower.id}`;
                });

                // Слушатель для кнопки "Купить"
                section.querySelector('.cardGood')?.addEventListener('click', () => {
                    addToBasket(flower.id);
                });

                // Слушатель для кнопки "Лайк"
              /*  section.querySelector('.wishGood')?.addEventListener('click', () => {
                    toggleFavorite(flower.id);
                });*/
                const likeBtn = section.querySelector('.wishGood') as HTMLButtonElement | null;
                likeBtn?.addEventListener('click', () => {
                    if (likeBtn) {
                        toggleFavorite(flower.id, likeBtn);
                    }
                });

            });

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
        const response = await fetch('/api/basket/addItem', { // Проверьте этот роут на бэкенде
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
async function toggleFavorite(flowerId: number, buttonElement: HTMLButtonElement): Promise<void> {
    try {
        const response = await fetch('/api/favorites/toggle', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flowerId })
        });
        const data = await response.json();
        if (data.change === 'ok' || !data.mes) {
            if (data.isFavorite) {
                buttonElement.classList.add('active');
            } else {
                buttonElement.classList.remove('active');
            }
        }
    } catch (e) {
        console.error(e);
    }
}
});