// Описываем все глобальные события приложения и их данные (типобезопасность!)
export interface AppEvents {
    'cart:updated': { count: number };
    'favorites:updated': { count: number }; // на будущее, если появится счетчик в шапке
}

class AppEventBus {
    // Отправить событие
    public emit<K extends keyof AppEvents>(eventName: K, detail: AppEvents[K]): void {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    // Подписаться на событие
    public on<K extends keyof AppEvents>(eventName: K, handler: (detail: AppEvents[K]) => void): void {
        document.addEventListener(eventName, (event: Event) => {
            const customEvent = event as CustomEvent<AppEvents[K]>;
            handler(customEvent.detail);
        });
    }
}

// Экспортируем единственный экземпляр (Singleton) на весь фронтенд
export const eventBus = new AppEventBus();