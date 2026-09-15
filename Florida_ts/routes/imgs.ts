import Router from 'express';
const router = Router();
import imgController from '../controllers/imgController';
import checkRole from '../middleware/checkRoleMiddleware';



router.post('/create', checkRole('ADMIN'), imgController.create);
router.delete('/delete/:id', checkRole('ADMIN'), imgController.delete);
router.get('/getAll/:flowerId', imgController.getAll);
router.get('/getOne/:id', imgController.getOne);


export default router;