const Router = require('koa-router');
const User = require('../models/User');
const { authenticate, authJWT } = require('../config/auth');

const router = Router();

router.get('/users/current', authJWT.required, async (ctx, next) => {
  const user = await User.findById(ctx.state.user.id);
  ctx.body = { user: user.toAuthJSON() };
});

router.put('/users/current', authJWT.required, async (ctx, next) => {
  const { user: newUser } = ctx.request.body;
  const user = await User.findById(ctx.state.user.id);

  // TODO: add validator library
  // user email and password can change only with
  // the users that have beeen registered through local
  // Also password and email can not be empty strings
  if (typeof newUser.username !== 'undefined') {
    user.username = newUser.username;
  }
  if (typeof newUser.email !== 'undefined') {
    user[user.method].email = newUser.email;
  }
  if (typeof newUser.bio !== 'undefined') {
    user.bio = newUser.bio;
  }
  if (typeof newUser.image !== 'undefined') {
    user.image = newUser.image;
  }
  if (typeof newUser.password !== 'undefined') {
    user[user.method].hash = newUser.password;
  }

  await user.save();

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
