import Router from 'express';
const router = Router();
import favoriteController from '../controllers/favoritesController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import favoritesController from '../controllers/favoritesController.js';

router.get('/getAll', authMiddleware(), favoriteController.getAll);
router.post('/toggle', authMiddleware(), favoriteController.toggle);
router.get('/getAllCategory', authMiddleware(), favoriteController.getAllCategory);
router.get('/check/:flowerId', authMiddleware(), favoritesController.check);

export default router;