import Router from 'express';
const router = Router();
import flowerController from '../controllers/flowerController.js';
import checkRole from '../middleware/checkRoleMiddleware.js';

router.post('/create',checkRole('ADMIN'), flowerController.create);
router.put('/change',checkRole('ADMIN'), flowerController.change);
router.delete('/delete/:id', checkRole('ADMIN'), flowerController.delete);
router.get('/getAll', flowerController.getAll);
router.get('/getOne/:id', flowerController.getOne);

export default router;