const Router = require('koa-router');

const { authenticate } = require('../config/auth');

const router = Router();

router.post('/oauth/facebook/token', authenticate('facebook-token'));
router.post('/oauth/google/token', authenticate('google-token'));
router.post('/oauth/github/token', authenticate('github-token'));

module.exports = router.routes();
