import Router from 'express';
const router = Router();
import basketFlowerController from '../controllers/basketFlowerController.js';
import checkRole from '../middleware/checkRoleMiddleware.js';

router.post('/create',checkRole('ADMIN'), basketFlowerController.create);
router.put('/change',checkRole('ADMIN'), basketFlowerController.change);
router.delete('/delete', checkRole('ADMIN'), basketFlowerController.delete);
router.get('/getAll', basketFlowerController.getAll);
router.get('/getOne/:id', basketFlowerController.getOne);

export default router;