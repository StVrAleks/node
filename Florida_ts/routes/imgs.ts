import Router from 'express';
const router = Router();
import multer from 'multer';
const upload = multer({ dest: 'static/uploads/' }); 
import imgController from '../controllers/imgController.js';
import checkRole from '../middleware/checkRoleMiddleware.js';



router.post('/create', checkRole('ADMIN'), imgController.create);
router.delete('/delete/:id', checkRole('ADMIN'), imgController.delete);
router.get('/getAll/:flowerId', imgController.getAll);
router.get('/getOne/:id', imgController.getOne);
router.put('/saveGalleryGroup', checkRole('ADMIN'), upload.array('newFiles'), imgController.saveGalleryGroup);
export default router;