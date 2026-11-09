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

        // Ищем элементы через data-атрибуты локально ВНУТРИ контейнера, а не по всему документу!
        this.input = this.container.querySelector('#product-qty') as HTMLInputElement;
        this.minusBtn = this.container.querySelector('#qty-minus') as HTMLButtonElement;
        this.plusBtn = this.container.querySelector('#qty-plus') as HTMLButtonElement;

        if (!this.input) {
            throw new Error('[QuantitySelector] Элемент инпута [data-qty] не найден внутри контейнера._PRODUCT_UI');
        }

        // Конфигурация ограничений
        this.min = options.min ?? 1;
        this.max = options.max ?? 99; // Защита от дурака / спама
        this.onChange = options.onChange;

        // Устанавливаем начальное значение
        const initialValue = options.initial ?? (parseInt(this.input.value, 10) || this.min);
        console.log('initialValue ', initialValue);
        this.setValue(initialValue);
        this.initEvents();
    }

    /**
     * Инициализация обработчиков событий
     */
    private initEvents(): void {
        this.minusBtn?.addEventListener('click', () => this.handleDecrement());
        this.plusBtn?.addEventListener('click', () => this.handleIncrement());
        
        // Важнейший хук: отслеживаем ручной ввод пользователя
        this.input.addEventListener('change', () => this.handleInputChange());
        
        // Запрещаем ввод нецифровых символов на лету
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

    /**
     * Возвращает текущее валидное число
     */
    public getValue(): number {
        return parseInt(this.input.value, 10) || this.min;
    }

    /**
     * Централизованный метод изменения значения с жесткой валидацией
     */
    public setValue(value: number): void {
        let validatedValue = value;

        // Если прилетел NaN (например, стерли всё из инпута)
        if (isNaN(validatedValue)) {
            validatedValue = this.min;
        }

        // Проверка жестких границ
        if (validatedValue < this.min) validatedValue = this.min;
        if (validatedValue > this.max) validatedValue = this.max;

        // Обновляем DOM
        this.input.value = String(validatedValue);

        // Управляем доступностью кнопок (визуальный фидбек для пользователя)
        this.toggleButtonStates(validatedValue);

        // Вызываем callback, чтобы product-main.ts или калькулятор цены узнали об изменениях
        if (this.onChange) {
            this.onChange(validatedValue);
        }
    }

    /**
     * Блокирует кнопки, если достигнут лимит
     */
    private toggleButtonStates(currentValue: number): void {
        if (this.minusBtn) {
            this.minusBtn.disabled = currentValue <= this.min;
        }
        if (this.plusBtn) {
            this.plusBtn.disabled = currentValue >= this.max;
        }
    }
}