const Router = require('koa-router');
const usersRoutes = require('./users');

const router = new Router();
const api = new Router();

api.use(usersRoutes);
router.use('/api', api.routes());

module.exports = router;
