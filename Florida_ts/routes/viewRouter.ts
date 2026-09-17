import Router from 'express';
const router = Router();
import favoriteSSRController from '../controllers/FavoriteSSRController';
import cabinetController from '../controllers/CabinetController';
import authMiddleware from '../middleware/authMiddleware';

// SSR-страницы для браузера
router.get('/cabinet', authMiddleware, cabinetController.renderCabinet);
router.get('/favorites', authMiddleware, favoriteSSRController.renderFavorites); // <--- ПОДВЯЗАЛИ SSR ТУДА

export default router;