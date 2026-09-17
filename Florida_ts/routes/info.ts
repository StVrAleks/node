import Router from 'express';
const router = Router();
import infoController from '../controllers/infoController.js';
import checkRole from '../middleware/checkRoleMiddleware.js';

router.post('/create', checkRole('ADMIN'), infoController.create); //creare + update
router.delete('/delete/:id', checkRole('ADMIN'), infoController.delete);
router.put('/update', checkRole('ADMIN'), infoController.update);
router.get('/getAll', infoController.getAll);
router.get('/getOne/:id', infoController.getOne);

export default router;