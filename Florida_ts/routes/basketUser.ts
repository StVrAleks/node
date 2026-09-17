import Router from 'express';
const router = Router();
import basketUserController from '../controllers/basketUserController.js';


router.get('/getByUserId', basketUserController.getByUserId);
router.post('/clear', basketUserController.clear);

export default router;