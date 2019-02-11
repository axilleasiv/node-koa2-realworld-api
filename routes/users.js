const Router = require('koa-router');
const User = require('../models/User');
const { authLocal } = require('../config/auth');

const router = Router();

router.get('/users/current', async (ctx, next) => {
  ctx.body = 'Users current';
});

router.post('/users/login', authLocal);

router.post('/users', async (ctx, next) => {
  const { user: newUser } = ctx.request.body;
  const user = new User({
    method: 'local',
    username: newUser.username,
    local: {
      email: newUser.email,
      hash: newUser.password
    }
  });

  await user.save();

  ctx.body = { user: user.toAuthJSON() };
});

module.exports = router.routes();
