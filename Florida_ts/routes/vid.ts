import Router from 'express';
const router = Router();
import vidController from '../controllers/vidController';
import checkRole from '../middleware/checkRoleMiddleware';

router.post('/create', checkRole('ADMIN'), vidController.create);
router.delete('/delete/:id', checkRole('ADMIN'), vidController.delete);
router.put('/change', checkRole('ADMIN'), vidController.change);
router.get('/getAll', vidController.getAll);
router.get('/getOne/:id', vidController.getOne);

export default router;