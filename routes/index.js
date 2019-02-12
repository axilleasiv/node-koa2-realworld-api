const Router = require('koa-router');
const usersRoutes = require('./users');
const oauthRoutes = require('./oauth');
const profileRoutes = require('./profiles');
const tagRoutes = require('./tags');
const articleRoutes = require('./articles');

const router = new Router();
const api = new Router();

api.use(usersRoutes);
api.use(oauthRoutes);
api.use(profileRoutes);
api.use(tagRoutes);
api.use(articleRoutes);
router.use('/api', api.routes());

module.exports = router;
