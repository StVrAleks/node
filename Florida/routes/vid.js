const Router = require('express');
const router = new Router();
const vidController = require('../controllers/vidController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.post('/create', checkRole('ADMIN'), vidController.create);
router.post('/delete', checkRole('ADMIN'), vidController.delete);
router.post('/change', checkRole('ADMIN'), vidController.change);
router.post('/getAll', vidController.getAll);
router.post('/getOne', vidController.getOne);

module.exports = router;