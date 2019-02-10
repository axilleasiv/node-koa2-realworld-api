const Router = require('koa-router');

const router = Router();

router.get('/users/current', (ctx, next) => {
  ctx.body = 'Users current';
});

module.exports = router.routes();
