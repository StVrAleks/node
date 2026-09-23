import Router from 'express';
const router = Router();
import multer from 'multer';
const upload = multer({ dest: 'static/uploads/' }); 
import imgController from '../controllers/imgController.js';
import checkRole from '../middleware/checkRoleMiddleware.js';



router.post('/create', checkRole('ADMIN'), imgController.create);
router.post('/update', checkRole('ADMIN'), imgController.update);
router.delete('/delete/:id', checkRole('ADMIN'), imgController.delete);
router.get('/getAll/:id', imgController.getAll);
router.get('/getOne/:id', imgController.getOne);
router.put('/saveGalleryGroup', checkRole('ADMIN'), upload.array('newFiles'), imgController.saveGalleryGroup);
router.put('/updateGalleryGroup', checkRole('ADMIN'), imgController.updateGalleryGroup);
export default router;