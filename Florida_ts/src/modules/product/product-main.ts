
import { ProductApiService } from './product-api.js';
import { QuantitySelector } from './product-ui.js';

// Описываем интерфейс элементов внутри контроллера
interface FlowerElements {
    wrapper: HTMLElement;
    flStatus: HTMLElement;
    vidFl: HTMLElement;
    titleFl: HTMLElement;
    priceFl: HTMLElement;
    divImg: HTMLElement;
    descrContainer: HTMLElement;
    cartBtn: HTMLElement;
    favBtn: HTMLElement;
}

export class ProductPageController {
    // Сервис API создается один раз при инициализации контроллера
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
    const cartBtn = document.getElementById('add-to-cart-btn');
    const favBtn = document.getElementById('fav-toggle-btn');

    if (!wrapper || !divImg || !descrContainer || !cartBtn || !favBtn || !flStatus || !vidFl || !titleFl || !priceFl) {
        console.error('Критическая ошибка: Не все DOM-элементы карточки товара найдены.');
        return;
    }

    const idFl = wrapper.dataset.flowerId;
    if (!idFl) {
        console.error('Критическая ошибка: ID цветка не найден в data-атрибутах wrapper.');
        return;
    }

    this.elements = { wrapper, flStatus, vidFl, titleFl, priceFl, divImg, descrContainer, cartBtn, favBtn };

    // 1. СНАЧАЛА полностью загружаем данные через API и рендерим HTML!
    await this.loadProductData(idFl);
    
    // 2. И ТОЛЬКО ТЕПЕРЬ, когда всё точно отрисовалось, ищем блок количества и оживляем его:
    const qtyContainer = document.querySelector('.quantity-selector') as HTMLElement | null;
    console.log('Попытка найти контейнер после рендера:', qtyContainer); // Этот лог покажет, нашелся ли он
    
    if (qtyContainer) {
        this.qtySelector = new QuantitySelector(qtyContainer, {
            onChange: (newQty) => console.log('Количество изменилось:', newQty)
        });
    } else {
        console.error('Критическая ошибка: Блок .quantity-selector не найден в HTML даже после загрузки данных!');
    }
    
    // 3. Навешиваем остальные события
    this.initEvents(idFl);
}

    private async loadProductData(idFl: string): Promise<void> {
        if (!this.elements) return;

        try {
            // Запросы пойдут параллельно. Если они уже в кэше API — вернутся мгновенно
            const [flowerData,imgData, descData] = await Promise.all([
                this.apiService.loadFlowerData(idFl),
                this.apiService.loadFlowerImages(idFl),
                this.apiService.loadFlowerDescription(idFl)
            ]);

            this.renderFlowerData(flowerData);
            this.renderImages(imgData);
            this.renderDescription(descData);
        } catch (error) {
            console.error('Ошибка загрузки данных карточки:', error);
        }
    }

    private initEvents(idFl: string): void {
        this.elements?.cartBtn.addEventListener('click', () => this.handleAddToCart(idFl));
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
                // UI логика перекраски кнопки КОРЗИНЫ здесь, в main/UI контроллере!
                const cartBtn = this.elements.cartBtn;
                cartBtn.classList.add('in-cart');
                const btnText = cartBtn.querySelector('.btn-text');
                if (btnText) btnText.textContent = '✓ Добавлено';
                alert('Товар успешно добавлен в корзину!');
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