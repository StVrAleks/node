const Router = require('express');
const router = new Router();
const infoController = require('../controllers/infoController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/create', checkRole('ADMIN'), infoController.create); //creare + update
router.post('/delete', checkRole('ADMIN'), infoController.delete);
router.post('/update', checkRole('ADMIN'), infoController.update);
router.post('/getAll', infoController.getAll);
router.post('/getOne', infoController.getAll);

module.exports = router;