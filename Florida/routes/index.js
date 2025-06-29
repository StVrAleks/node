
const Router = require('express');
//const apiError = require('../error/ApiError');
const router = new Router();
const userRouter = require('./user');
const flowerRouter = require('./flower');
const vidRouter = require('./vid');
const infoRouter = require('./info');
const imgRouter = require('./imgs');


router.use('/user', userRouter);
router.use('/vid', vidRouter);
router.use('/flower', flowerRouter);
router.use('/info', infoRouter);
router.use('/imgs', imgRouter);


module.exports = router;