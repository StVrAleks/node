import Router from 'express';
const router = Router();
import favoriteController from '../controllers/favoritesController';
import checkRole from '../middleware/checkRoleMiddleware';

router.post('/create',checkRole('ADMIN'), favoriteController.create);
router.delete('/delete/:id', checkRole('ADMIN'), favoriteController.delete);
router.get('/getAll', favoriteController.getAll);
router.get('/getOne/:id', favoriteController.getOne);

export default router;