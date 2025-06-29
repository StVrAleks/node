const Router = require('express');
const router = new Router();
const flowerController = require('../controllers/flowerController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/create',checkRole('ADMIN'), flowerController.create);
router.post('/change',checkRole('ADMIN'), flowerController.change);
router.post('/delete',checkRole('ADMIN'), flowerController.delete);
router.get('/getAll', flowerController.getAll);
router.post('/getOne', flowerController.getOne);
//добавить удаление
module.exports = router;