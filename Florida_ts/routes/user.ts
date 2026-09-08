import Router from 'express';
const router = Router();
import userController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';
import authMiddlewareUser from '../middleware/authMiddlewareUser';
import checkRole from '../middleware/checkRoleMiddleware';

router.post('/registration',userController.registration);
router.post('/login',userController.login);
router.get('/auth',authMiddleware, userController.check);
router.get('/authUser',authMiddlewareUser, userController.check);
router.get('/verify',userController.verify);
router.post('/logout',userController.logout);
router.get('/allUsers',checkRole('ADMIN'), userController.allUsers);
router.put('/changeUser', checkRole('ADMIN'), userController.changeUser);



export default router;