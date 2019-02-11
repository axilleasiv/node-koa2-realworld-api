const passport = require('koa-passport');
const jwt = require('koa-jwt');

const { jwtSecret } = require('./index');

const authenticate = strategy => async (ctx, next) => {
  return passport.authenticate(strategy, (err, user) => {
    if (err) {
      return ctx.throw(500, err);
    }

    // If there were no errors and no user was retrieved, it's an
    // authentication issue. i.e., HTTP 401 Unauthorized.
    if (!user) {
      return ctx.throw(401, err);
    }

    ctx.body = { user: user.toAuthJSON() };
  })(ctx, next);
};

const authJWT = {
  required: jwt({
    secret: jwtSecret
  }),
  optional: jwt({
    secret: jwtSecret,
    passthrough: true
  })
};

module.exports = {
  authenticate,
  authJWT
};
