import Router from 'express';
const router = Router();
import favoriteController from '../controllers/favoritesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

router.get('/getAll', authMiddleware(), favoriteController.getAll);
router.post('/toggle', authMiddleware(), favoriteController.toggle);
export default router;