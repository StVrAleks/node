
import { ProductApiService } from './product-api.js';
import { QuantitySelector, ProductSlider } from './product-ui.js';
import { FavoriteResponse } from '../../types.js'; 
// Описываем интерфейс элементов внутри контроллера
interface FlowerElements {
    wrapper: HTMLElement;
    flStatus: HTMLElement;
    vidFl: HTMLElement;
    titleFl: HTMLElement;
    priceFl: HTMLElement;
    divImg: HTMLElement;
    descrContainer: HTMLElement;
    cartBtn: HTMLButtonElement;
    favBtn: HTMLButtonElement;
    favUseEl: SVGUseElement | null;
}

export class ProductPageController {
    private readonly apiService = new ProductApiService();
    private elements: FlowerElements | null = null;
    private qtySelector: QuantitySelector | null = null;

    public async initFlowerModule(): Promise<void> {
        const wrapper = document.querySelector('.product-page-wrapper') as HTMLElement | null;
        const flStatus = document.getElementById('flStatus');
        const vidFl = document.getElementById('vidFl');
        const titleFl = document.getElementById('titleFl');
        const priceFl = document.getElementById('priceFl');
        const divImg = document.getElementById('imgsFl');
        const descrContainer = document.getElementById('descr');
        const cartBtn = document.getElementById('add-to-cart-btn') as HTMLButtonElement | null;
        const favBtn = document.getElementById('fav-toggle-btn') as HTMLButtonElement | null;

        if (!wrapper || !divImg || !descrContainer || !cartBtn || !favBtn || !flStatus || !vidFl || !titleFl || !priceFl) {
            console.error('Критическая ошибка: Не все DOM-элементы карточки товара найдены.');
            return;
        }

        const idFl = wrapper.dataset.flowerId;
        if (!idFl) {
            console.error('Критическая ошибка: ID цветка не найден в data-атрибутах wrapper.');
            return;
        }

        const favUseEl = favBtn.querySelector('use') as SVGUseElement | null;

        this.elements = {
            wrapper, flStatus, vidFl, titleFl, priceFl,
            divImg, descrContainer, cartBtn, favBtn, favUseEl
        };

        // 1. Загружаем данные (статус isFavorite должен приходить здесь, в flowerData)
        await this.loadProductData(idFl);

        // 2. Оживляем блок выбора количества
        const qtyContainer = document.querySelector('.quantity-selector') as HTMLElement | null;
        if (qtyContainer) {
            this.qtySelector = new QuantitySelector(qtyContainer, {
                onChange: (newQty) => console.log('Количество изменилось:', newQty)
            });
        }

        // 3. Навешиваем события (никаких вызовов toggleFavorite при загрузке!)
        this.initEvents(idFl);
    }
private async loadProductData(idFl: string): Promise<void> {
        if (!this.elements) return;

        try {
            // Все 4 запроса идут параллельно и не тормозят друг друга
            const [flowerData, imgData, descData, favStatus] = await Promise.all([
                this.apiService.loadFlowerData(idFl),
                this.apiService.loadFlowerImages(idFl),
                this.apiService.loadFlowerDescription(idFl),
                this.apiService.checkFavorite(Number(idFl))
            ]);

            this.renderFlowerData(flowerData);
            this.renderImages(imgData);
            this.renderDescription(descData);
            
            // Сразу зажигаем сердечко, если товар уже был в избранном
            this.updateFavoriteUI(Boolean(favStatus?.isFavorite));
        } catch (error) {
            console.error('Ошибка загрузки данных карточки:', error);
        }
    }

    private initEvents(idFl: string): void {
        this.elements?.cartBtn.addEventListener('click', () => this.handleAddToCart(idFl));

        this.elements?.favBtn.addEventListener('click', async () => {
            const favBtn = this.elements?.favBtn;
            if (!favBtn || favBtn.disabled) return;

            favBtn.disabled = true;

            try {
                // Передаём только ID цветка, без DOM-элемента
                const togStatus: FavoriteResponse = await this.apiService.toggleFavorite(Number(idFl));
                this.updateFavoriteUI(Boolean(togStatus.isFavorite));
            } catch (error) {
                console.error('Ошибка при изменении избранного:', error);
            } finally {
                favBtn.disabled = false;
            }
        });
    }

    // Единый метод отрисовки состояния сердечка (используем и при загрузке, и при клике)
    private updateFavoriteUI(isFav: boolean): void {
        if (!this.elements) return;

        this.elements.favBtn.classList.toggle('active', isFav);
        this.elements.favBtn.title = isFav ? 'Убрать из избранного' : 'Добавить в избранное';

        if (this.elements.favUseEl) {
            const iconId = isFav ? '#icon-favorites-filled' : '#icon-favorites';
            this.elements.favUseEl.setAttribute('href', iconId);
        }
    }

    private async handleAddToCart(idFl: string): Promise<void> {
        if (!this.elements) return;
        
        const quantity = this.qtySelector ? this.qtySelector.getValue() : 1;

        try {
            const data = await this.apiService.addToCart({
                flowerId: parseInt(idFl, 10),
                quantity
            });

            if (data.change === 'ok' || !data.mes) {
                const cartBtn = this.elements.cartBtn;
                const btnText = cartBtn?.querySelector('.btn-text');


                if (data.action === 'added') {
                    cartBtn?.classList.add('in-cart');
                    if (btnText) btnText.textContent = '✓ Добавлено';
                } else if (data.action === 'removed') {
                    cartBtn?.classList.remove('in-cart');
                    if (btnText) btnText.textContent = 'В корзину';
                }

            // Обновляем счётчик в шапке
            const countBubble = document.querySelector('[data-cart-count]');
            if (countBubble && data.cartCount !== undefined) {
                countBubble.textContent = String(data.cartCount);
            }
        }
    } catch (e) {
            console.error(e);
        }
    }

    private renderFlowerData(data: any): void {
        if (!this.elements || !data) return;

        const productPrice = Number(data.price).toFixed(2);
        if (this.elements.flStatus) this.elements.flStatus.textContent = data.status !== undefined && data.status !== null ? String(data.status) : '';
        if (this.elements.vidFl) this.elements.vidFl.textContent = data.flower_vid?.name !== undefined && data.flower_vid?.name !== null ? String(data.flower_vid?.name) : '';
        if (this.elements.titleFl) this.elements.titleFl.textContent = data.name !== undefined && data.name !== null ? String(data.name) : '';
        if (this.elements.priceFl) this.elements.priceFl.textContent = productPrice !== undefined && productPrice !== null ? String(productPrice) : '';
        this.updateFavoriteUI(Boolean(data.isFavorite));
        
        if (data.inCart) {
            this.elements.cartBtn.classList.add('in-cart');
            const btnText = this.elements.cartBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = '✓ Добавлено';
        }
    }

    private renderImages(data: any): void {
        if (!this.elements) return;
        this.elements.divImg.innerHTML = ''; // очистка
        
        if (data.rows && data.rows.length > 0) {
            const fragment = document.createDocumentFragment();
            data.rows.forEach((row: any) => {
                const img = document.createElement("img");
                img.src = `/imgStore/${row.img}`;
                img.alt = "Фото букета";
                fragment.appendChild(img);
            });
            this.elements.divImg.appendChild(fragment);
            new ProductSlider(this.elements.divImg);
        }
    }

    private renderDescription(data: any): void {
    if (!this.elements) return;
    
    // Проверяем, что данные пришли и это массив с элементами
    if (!data || !Array.isArray(data) || data.length === 0) {
        this.elements.descrContainer.innerHTML = '<div class="descriptionFlowerStyle">Описание отсутствует.</div>';
        return;
    }

    // 1. Очищаем контейнер ВСЕГО ОДИН РАЗ перед началом цикла
    this.elements.descrContainer.textContent = '';

    // 2. Создаем виртуальный контейнер в памяти для супер-производительности
    const fragment = document.createDocumentFragment();

    // Используем современный for...of вместо старого for(var...)
    for (const item of data) {
        // Проверка заголовка
        const titleText = item.title && item.title.trim() !== "" ? item.title.trim() : "Характеристики букета";
        const divTitle = document.createElement("div");  
        divTitle.textContent = titleText;
        divTitle.className = 'descrStyle';

        // Проверка описания
        const descText = item.description && item.description.trim() !== "" 
            ? item.description.trim() 
            : "Текстовое описание для данного товара временно отсутствует.";
        const divDesc = document.createElement("div");  
        divDesc.textContent = descText;
        divDesc.className = 'descriptionFlowerStyle';

        // 3. Добавляем элементы во фрагмент (это происходит моментально в памяти)
        fragment.appendChild(divTitle);   
        fragment.appendChild(divDesc);
    }    

    // 4. Вставляем ВЕСЬ результат в DOM за один единственный проход
    this.elements.descrContainer.appendChild(fragment);
}
}