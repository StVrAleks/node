import Router from 'express';
const router = Router();
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authMiddlewareUser from '../middleware/authMiddlewareUser.js';
import checkRole from '../middleware/checkRoleMiddleware.js';

router.post('/registration',userController.registration);
router.post('/login',userController.login);
router.get('/auth',authMiddleware, userController.check);
router.get('/authUser',authMiddlewareUser, userController.check);
router.get('/verify',userController.verify);
router.post('/logout',userController.logout);
router.get('/allUsers',checkRole('ADMIN'), userController.allUsers);
router.put('/changeUser', checkRole('ADMIN'), userController.changeUser);
router.put('/updateProfile', authMiddleware, userController.updateProfile);


export default router;