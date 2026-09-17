
const Router = require('express');
//const apiError = require('../error/ApiError');
const router = new Router();
const userRouter = require('./user');
const flowerRouter = require('./flower');
const vidRouter = require('./vid');
const infoRouter = require('./info');
const imgRouter = require('./imgs');
const basketRouter = require('./basketFlower');
const basketUserRouter = require('./basketUser');
const favotiteRouter = require('./favorites');
const ordersRouter = require('./order');
const viewRouter = require('./viewRouter');


router.use('/user', userRouter);
router.use('/vid', vidRouter);
router.use('/flower', flowerRouter);
router.use('/info', infoRouter);
router.use('/imgs', imgRouter);
router.use('/basketFlower', basketRouter);
router.use('/basketUser', basketUserRouter);
router.use('/favorites', favotiteRouter);
router.use('/order', ordersRouter);
router.use('/', viewRouter);

module.exports = router;