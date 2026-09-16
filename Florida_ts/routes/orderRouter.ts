import Router from 'express';
const router = Router();
import orderController from '../controllers/orders';
import authMiddleware from '../middleware/authMiddleware';

// Маршрут для оформления заказа по кнопке из Корзины
router.post('/create', authMiddleware, orderController.createOrder);

// Наш прошлый роут для истории в личном кабинете
router.get('/my-orders', authMiddleware, orderController.getMyOrders);

export default router;