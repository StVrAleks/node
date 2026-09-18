import { Request, Response, NextFunction } from 'express';
import { Basket, BasketFlower, Flowers, Order, OrderFlower } from '../models/models.js';
import ApiError from '../error/ApiError.js';
import logger from '../middleware/winston.js';
import { Op } from 'sequelize';

interface CreateOrderRequestBody {
    phone: string;
    address: string;
}

class OrderController {
    /**
     * Оформление заказа из корзины (POST /api/orders/create)
     */
    async createOrder(request: Request<{}, {}, CreateOrderRequestBody>, response: Response, next: NextFunction): Promise<Response | void> {
        const sequelize = Order.sequelize;
        if (!sequelize) {
            return next(ApiError.internal('Не удалось инициализировать контекст базы данных'));
        }

        // Открываем транзакцию, чтобы гарантировать целостность данных
        const transaction = await sequelize.transaction();

        try {
            const userId = (request as any).user?.id;
            const { phone, address } = request.body;

            if (!userId) {
                return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
            }

            if (!phone || !address) {
                return next(ApiError.badRequest('Не заполнен телефон или адрес доставки для заказа'));
            }

            // 1. Ищем корзину текущего пользователя
            const userBasket = await Basket.findOne({ 
                where: { userId }, 
                transaction 
                });
            if (!userBasket) {
                return next(ApiError.badRequest('Корзина пользователя не найдена'));
            }

            // 2. Получаем все цветы, которые сейчас лежат в корзине
            const basketItems = await BasketFlower.findAll({
                where: { 
                    basketId: userBasket.id,
                    quantity: { [Op.gt]: 0 } },
                include: [{ model: Flowers, attributes: ['price'] }], // Подтягиваем текущую цену цветка
                transaction
            });

            if (!basketItems || basketItems.length === 0) {
                return next(ApiError.badRequest('Невозможно оформить заказ: ваша корзина пуста'));
            }

            // 3. Вычисляем общую стоимость заказа на основе текущих цен в каталоге
            let totalPrice = 0;
            basketItems.forEach((item: any) => {
                const price = Number(item.Flower?.price || 0);
                const quantity = Number(item.quantity || 1);
                totalPrice += price * quantity;
            });

            // 4. Создаем главную запись заказа в таблице Order
            const newOrder = await Order.create({
                userId: Number(userId),
                totalPrice: Number(totalPrice.toFixed(2)),
                phone: phone.trim(),
                address: address.trim(),
                status: 'Новый'
            }, { transaction });

            // 5. Переносим каждую позицию из корзины в OrderFlower с фиксацией цены
            for (const item of basketItems) {
                const currentPrice = Number((item as any).Flower?.price || 0);
                
                await OrderFlower.create({
                    orderId: newOrder.id,
                    flowerId: item.flowerId,
                    quantity: item.quantity,
                    price: currentPrice // Намертво запечатываем цену на момент покупки!
                }, { transaction });
            }

            // 6. Очищаем корзину пользователя (удаляем связи из BasketFlower, где количество > 0)
            await BasketFlower.destroy({
                where: { 
                    basketId: userBasket.id,
                    quantity: { [Op.gt]: 0 } },
                transaction
            });

            // Если всё прошло гладко — сохраняем изменения в MySQL
            await transaction.commit();
            logger.info(`/Flowerida_Бэк: Пользователь ID ${userId} успешно оформил заказ #${newOrder.id} на сумму ${totalPrice} BYN`);

            return response.status(201).json({ change: 'ok', orderId: newOrder.id });

        } catch (error: any) {
            // Если произошел сбой — откатываем базу данных к исходному состоянию
            await transaction.rollback();
            logger.error('Ошибка в OrderController.createOrder:', error.message);
            return next(ApiError.internal('Внутренняя ошибка сервера при оформлении заказа'));
        }
    }
async getMyOrders(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
        const userId = (request as any).user?.id;

        if (!userId) {
            return next(ApiError.forbidden('Доступ запрещен: требуется авторизация'));
        }

        // Запрашиваем позиции напрямую, чтобы структура подошла под фронтенд
        const orderItems = await OrderFlower.findAll({
            include: [
                {
                    model: Order,
                    where: { userId },
                    attributes: [] // Исключаем поля заказа, чтобы не раздувать трафик
                },
                {
                    model: Flowers,
                    attributes: ['name', 'price'] // Тянем данные для фронтенда
                }
            ],
            order: [[Order, 'createdAt', 'DESC']] // Сортируем по дате создания заказа
        });

        return response.json({ rows: orderItems });
    } catch (error: any) {
        logger.error('Ошибка в OrderController.getMyOrders:', error.message);
        return next(ApiError.internal('Внутренняя ошибка сервера при чтении истории заказов'));
    }
}
}

export default new OrderController();