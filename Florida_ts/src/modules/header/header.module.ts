import { eventBus } from '../../core/event-bus.js';

export class HeaderController {
    private countBubble: HTMLElement | null = null;

    public init(): void {
        this.countBubble = document.querySelector('[data-cart-count]');
        
        // Если на странице (например, в админке) нет счетчика корзины — выходим
        if (!this.countBubble) return;

        // 1. Подписываемся на обновления корзины из любых модулей (товар, каталог, корзина)
        eventBus.on('cart:updated', ({ count }) => {
            this.updateCartBadge(count);
        });

        // 2. Если сервер при рендере HBS не подставил цифру — запрашиваем сами
        if (!this.countBubble.textContent?.trim()) {
            this.fetchInitialCartCount();
        }
    }

    private async fetchInitialCartCount(): Promise<void> {
        try {
            const res = await fetch('/api/basketUser/cart');
            if (!res.ok) return;
            
            const data = await res.json();
            if (data && data.cartCount !== undefined) {
                this.updateCartBadge(data.cartCount);
            }
        } catch (err) {
            console.error('[Header] Не удалось загрузить счетчик корзины:', err);
        }
    }

    private updateCartBadge(count: number): void {
        if (!this.countBubble) return;
        
        this.countBubble.textContent = String(count);
        // Бонус: можно прятать кружок, если в корзине 0 товаров
        this.countBubble.classList.toggle('hidden', count <= 0);
    }
}