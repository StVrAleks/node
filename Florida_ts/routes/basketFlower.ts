import Router from 'express';
const router = Router();
import basketFlowerController from '../controllers/basketFlowerController';
import checkRole from '../middleware/checkRoleMiddleware';

router.post('/create',checkRole('ADMIN'), basketFlowerController.create);
router.put('/change',checkRole('ADMIN'), basketFlowerController.change);
router.delete('/delete', checkRole('ADMIN'), basketFlowerController.delete);
router.get('/getAll', basketFlowerController.getAll);
router.get('/getOne/:id', basketFlowerController.getOne);

export default router;