const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authMiddlewareUser = require('../middleware/authMiddlewareUser');
const ApiError = require('../error/ApiError');
const checkRole = require('../middleware/checkRoleMiddleware');

//console.log(Object.keys(userController));
router.post('/registration',userController.registration);
router.post('/login',userController.login);
router.get('/auth',authMiddleware, userController.check);
router.get('/authUser',authMiddlewareUser, userController.check);
router.get('/verify',userController.verify);
router.post('/logout',userController.logout);
router.post('/allUsers',checkRole('ADMIN'), userController.allUsers);
router.post('/changeUser', checkRole('ADMIN'), userController.changeUser);



module.exports = router;