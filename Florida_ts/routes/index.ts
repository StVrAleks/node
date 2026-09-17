
import Router from 'express';
//const apiError = require('../error/ApiError');
const router = Router();
import userRouter from './user.js';
import flowerRouter from './flower.js';
import vidRouter from './vid.js';
import infoRouter from './info.js';
import imgRouter from './imgs.js';
import basketRouter from './basketFlower.js';
import basketUserRouter from './basketUser.js';
import favotiteRouter from './favorites.js';
import ordersRouter from './order.js';
import uploadRouter from './uploadRouter.js'
import { searchProducts } from '../controllers/product.controller.js';

router.use('/user', userRouter);
router.use('/vid', vidRouter);
router.use('/flower', flowerRouter);
router.use('/info', infoRouter);
router.use('/imgs', imgRouter);
router.use('/basketFlower', basketRouter);
router.use('/basketUser', basketUserRouter);
router.use('/favorites', favotiteRouter);
router.use('/order', ordersRouter);
router.use('/', uploadRouter); 
router.get('/products/search', searchProducts);

export default router;