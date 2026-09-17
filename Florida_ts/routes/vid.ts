import Router from 'express';
const router = Router();
import vidController from '../controllers/vidController.js';
import checkRole from '../middleware/checkRoleMiddleware.js';

router.post('/create', checkRole('ADMIN'), vidController.create);
router.delete('/delete/:id', checkRole('ADMIN'), vidController.delete);
router.put('/change', checkRole('ADMIN'), vidController.change);
router.get('/getAll', vidController.getAll);
router.get('/getOne/:id', vidController.getOne);

export default router;