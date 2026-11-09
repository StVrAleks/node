import { FlowerImagesResponse, FlowerDescriptionResponse, FlowerCacheResponse,  AddToCartPayload, AddToCartResponse } from '../../types.js'; 

export class ProductApiService {
    private readonly baseUrl: string = '/api';
    
    // Кэш для картинок и описаний (простые структуры данных, без DOM!)
    private flowerCache = new Map<string, FlowerCacheResponse | string>();    
    private imagesCache = new Map<string, FlowerImagesResponse>();
    private descriptionCache = new Map<string, FlowerDescriptionResponse>();

    /**
     * Загрузка картинок с поддержкой кэша
     */
    public async loadFlowerData(idFl: string): Promise<FlowerDescriptionResponse | string> {
        // Если данные уже есть в кэше — возвращаем их мгновенно без запроса к бэку
        if (this.flowerCache.has(idFl)) {
            return this.flowerCache.get(idFl)!;
        }

        const response = await fetch(`${this.baseUrl}/flower/getOne/${idFl}`, { method: "GET" });
        if (!response.ok) throw new Error(`[API] Ошибка картинок: ${response.status}`);
        
        const data = await response.json() as FlowerDescriptionResponse;
        
        // Сохраняем в кэш
        this.flowerCache.set(idFl, data);
        return data;
    }

    public async loadFlowerImages(idFl: string): Promise<FlowerImagesResponse> {
        // Если данные уже есть в кэше — возвращаем их мгновенно без запроса к бэку
        if (this.imagesCache.has(idFl)) {
            return this.imagesCache.get(idFl)!;
        }

        const response = await fetch(`${this.baseUrl}/imgs/getAll/${idFl}`, { method: "GET" });
        if (!response.ok) throw new Error(`[API] Ошибка картинок: ${response.status}`);
        
        const data = await response.json() as FlowerImagesResponse;
        
        // Сохраняем в кэш
        this.imagesCache.set(idFl, data);
        return data;
    }

    /**
     * Загрузка описания с поддержкой кэша
     */
    public async loadFlowerDescription(idFl: string): Promise<FlowerDescriptionResponse> {
        if (this.descriptionCache.has(idFl)) {
            return this.descriptionCache.get(idFl)!;
        }

        const response = await fetch(`${this.baseUrl}/info/getOne/${idFl}`, { method: "GET" });
        if (!response.ok) throw new Error(`[API] Ошибка описания: ${response.status}`);
        
        const data = await response.json() as FlowerDescriptionResponse;
        
        this.descriptionCache.set(idFl, data);
        return data;
    }

    public async addToCart(payload: AddToCartPayload): Promise<AddToCartResponse> {
        const response = await fetch(`${this.baseUrl}/basketUser/addItem`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`[API] Ошибка корзины: ${response.status}`);
        return await response.json() as AddToCartResponse;
    }
}