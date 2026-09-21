export interface ApiResponse<T = any> {
     total?: number;
    pages?: number;
    currentPage?: number;
    mes?: string;
    message?: string;
    change?: string;
    rows?: T[];
}

export interface UserAttributes {
    id: number,
    name: string,
    email: string,
    phone?: string;
    address?: string;
    password?: string,
    user_status: string,
    created_user: number,
    role: string
}

export interface VidAttributes {
    id: number,
    name: string
}

export interface FlowerAttributes {
    id: number,
    name: string,
    price: number,
    vidId: number,   
    vidName: string,
    status?: string; 
    mKeyWords?: string | undefined,
    mDescript?: string | undefined
}

export interface FlowerImgsAttributes {
    id: number,
    num?: number,
    img: string,
    flowerId: number
}

export interface FlowerInfoAttributes {
    id: number,
    title: string,
    description: string | undefined,
    flowerId: number
}

export interface OrderAttributes {
    id: number;
    userId: number;
    totalPrice: number;
    phone: string;
    address: string;
    status: 'Новый' | 'Готовится' | 'В пути' | 'Доставлено' | 'Отменен';
    createdAt?: Date;
    updatedAt?: Date;
}
export interface OrderFlowerAttributes {
    id: number;
    orderId: number;
    flowerId: number;
    quantity: number;
    price: number; // Фиксируем цену на момент покупки!
}
