const Router = require('koa-router');
const usersRoutes = require('./users');
const oauthRoutes = require('./oauth');

const router = new Router();
const api = new Router();

api.use(usersRoutes);
api.use(oauthRoutes);
router.use('/api', api.routes());

module.exports = router;
