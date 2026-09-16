import Router from 'express';
const router = Router();
import favoriteController from '../controllers/favoritesController';
import checkRole from '../middleware/checkRoleMiddleware';
import authMiddleware from '../middleware/authMiddleware';

router.get('/getAll', favoriteController.getAll);
router.post('/toggle', authMiddleware, favoriteController.toggle);
export default router;