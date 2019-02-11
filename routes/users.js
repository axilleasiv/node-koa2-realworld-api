const Router = require('koa-router');
const User = require('../models/User');
const { authenticate, authJWT } = require('../config/auth');

const router = Router();

router.get('/users/current', authJWT.required, async (ctx, next) => {
  const user = await User.findById(ctx.state.user.id);
  ctx.body = { user: user.toAuthJSON() };
});

router.post('/users/login', authenticate('local'));

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
