import Router from 'express';
const router = Router();
import orderController from '../controllers/orders.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Маршрут для оформления заказа по кнопке из Корзины
router.post('/create', authMiddleware, orderController.createOrder);

// Наш прошлый роут для истории в личном кабинете
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

export default router;