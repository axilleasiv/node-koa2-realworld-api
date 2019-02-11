const Router = require('koa-router');
const User = require('../models/User');
const { authJWT } = require('../config/auth');

const router = Router();

// Preload user profile on routes with ':username'
router.param('username', async (username, ctx, next) => {
  const user = await User.findOne({ username });

  if (!user) return (ctx.status = 404);

  ctx.state.profile = user;

  return next();
});

router.get('/profiles/:username', authJWT.optional, async (ctx, next) => {
  const { profile } = ctx.state;
  const { user: authenticatedUser } = ctx.state;

  if (authenticatedUser) {
    const user = await User.findById(authenticatedUser.id);

    if (!user) {
      ctx.body = { profile: profile.toProfileJSONFor(false) };
    }

    ctx.body = { profile: profile.toProfileJSONFor(user) };
  } else {
    ctx.body = { profile: profile.toProfileJSONFor(false) };
  }
});

router.post(
  '/profiles/:username/follow',
  authJWT.required,
  async (ctx, next) => {
    const { profile } = ctx.state;
    const { user: authenticatedUser } = ctx.state;

    const user = await User.findById(authenticatedUser.id);

    if (!user) return (ctx.status = 404);

    await user.follow(profile._id);

    ctx.body = { profile: profile.toProfileJSONFor(user) };
  }
);

router.delete(
  '/profiles/:username/follow',
  authJWT.required,
  async (ctx, next) => {
    const { profile } = ctx.state;
    const { user: authenticatedUser } = ctx.state;

    const user = await User.findById(authenticatedUser.id);

    if (!user) return (ctx.status = 404);

    await user.unfollow(profile._id);
    ctx.body = { profile: profile.toProfileJSONFor(user) };
  }
);

module.exports = router.routes();
