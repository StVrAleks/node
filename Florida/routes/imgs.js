const Router = require('express');
const router = new Router();
const imgController = require('../controllers/imgController');
const checkRole = require('../middleware/checkRoleMiddleware');



router.post('/create', checkRole('ADMIN'), imgController.create);
router.post('/delete', checkRole('ADMIN'), imgController.delete);
router.post('/getAll', imgController.getAll);


module.exports = router;