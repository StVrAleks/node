import Router from 'express';
const router = Router();
import basketUserController from '../controllers/basketUserController.js';
import authMiddleware from '../middleware/authMiddleware.js';


router.get('/cart', authMiddleware(), basketUserController.cart);
router.delete('/deleteItem', authMiddleware(), basketUserController.deleteItem);
router.post('/clear', authMiddleware(), basketUserController.clear);


export default router;