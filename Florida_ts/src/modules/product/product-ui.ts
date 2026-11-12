export interface QuantitySelectorOptions {
    min?: number;
    max?: number;
    initial?: number;
    onChange?: (newValue: number) => void;
}

export class QuantitySelector {
    private readonly container: HTMLElement;
    private readonly input: HTMLInputElement;
    private readonly minusBtn: HTMLButtonElement | null;
    private readonly plusBtn: HTMLButtonElement | null;
   
    private readonly min: number;
    private readonly max: number;
    private readonly onChange?: (newValue: number) => void;

    constructor(container: HTMLElement | null, options: QuantitySelectorOptions = {}) {
        if (!container) {
            throw new Error('[QuantitySelector] Корневой контейнер не передан.');
        }

        this.container = container;

        this.input = this.container.querySelector('#product-qty') as HTMLInputElement;
        this.minusBtn = this.container.querySelector('#qty-minus') as HTMLButtonElement | null;
        this.plusBtn = this.container.querySelector('#qty-plus') as HTMLButtonElement | null;
        
        if (!this.input) {
            throw new Error('[QuantitySelector] Элемент инпута #product-qty не найден внутри контейнера.');
        }

        this.min = options.min ?? 1;
        this.max = options.max ?? 99;
        this.onChange = options.onChange;

        const initialValue = options.initial ?? (parseInt(this.input.value, 10) || this.min);
        this.setValue(initialValue);
        this.initEvents();
    }

    private initEvents(): void {
        this.minusBtn?.addEventListener('click', () => this.handleDecrement());
        this.plusBtn?.addEventListener('click', () => this.handleIncrement());
        this.input.addEventListener('change', () => this.handleInputChange());

        this.input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (['e', 'E', '+', '-', ',', '.'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    private handleDecrement(): void {
        this.setValue(this.getValue() - 1);
    }

    private handleIncrement(): void {
        this.setValue(this.getValue() + 1);
    }

    private handleInputChange(): void {
        const parsedValue = parseInt(this.input.value, 10);
        this.setValue(parsedValue);
    }

    public getValue(): number {
        return parseInt(this.input.value, 10) || this.min;
    }

    public setValue(value: number): void {
        let validatedValue = isNaN(value) ? this.min : value;

        if (validatedValue < this.min) validatedValue = this.min;
        if (validatedValue > this.max) validatedValue = this.max;

        this.input.value = String(validatedValue);
        this.toggleButtonStates(validatedValue);

        if (this.onChange) {
            this.onChange(validatedValue);
        }
    }

    private toggleButtonStates(currentValue: number): void {
        if (this.minusBtn) {
            this.minusBtn.disabled = currentValue <= this.min;
        }
        if (this.plusBtn) {
            this.plusBtn.disabled = currentValue >= this.max;
        }
    }
}

export class ProductSlider {
    private readonly container: HTMLElement;
    private readonly slides: HTMLImageElement[];
    private currentIndex: number = 0;

    constructor(container: HTMLElement) {
        this.container = container;
        this.slides = Array.from(this.container.querySelectorAll('img'));

        // Если картинок 0 или 1 — кнопки навигации не нужны
        if (this.slides.length <= 1) return;

        this.initSlider();
    }

    private initSlider(): void {
        this.container.style.position = 'relative';

        // Показываем только первый слайд
        this.updateSlides();

        // Создаём кнопки Влево / Вправо
        const prevBtn = this.createNavButton('‹', 'slider-btn slider-prev', 'left: 10px;');
        const nextBtn = this.createNavButton('›', 'slider-btn slider-next', 'right: 10px;');

        prevBtn.addEventListener('click', () => this.prev());
        nextBtn.addEventListener('click', () => this.next());

        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
    }

    private createNavButton(text: string, className: string, posStyle: string): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.className = className;
        btn.style.cssText = `
            position: absolute; top: 50%; transform: translateY(-50%); ${posStyle}
            background: rgba(255, 255, 255, 0.8); border: 1px solid #ddd;
            border-radius: 50%; width: 36px; height: 36px; font-size: 20px;
            cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;
        `;
        return btn;
    }

    private updateSlides(): void {
        this.slides.forEach((img, index) => {
            img.style.display = index === this.currentIndex ? 'block' : 'none';
        });
    }

    public next(): void {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlides();
    }

    public prev(): void {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlides();
    }
}