const passport = require('koa-passport');
// const jwt = require('express-jwt');
const { jwtSecret } = require('./index');

const authFacebook = passport.authenticate('facebook-token', {
  session: false
});
const authGoogle = passport.authenticate('google-token', {
  session: false
});
const authGithub = passport.authenticate('github-token', {
  session: false
  // successRedirect: '/accessed',
  // failureRedirect: '/access',
});
const getTokenFromHeader = req => {
  const headAuth = req.headers.authorization;

  if (
    (headAuth && headAuth.split(' ')[0] === 'Token') ||
    (headAuth && headAuth.split(' ')[0] === 'Bearer')
  ) {
    return headAuth.split(' ')[1];
  }

  return null;
};

const authLocal = async (ctx, next) => {
  return passport.authenticate('local', (err, user) => {
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

// const authJWT = {
//   required: jwt({
//     secret: jwtSecret,
//     userProperty: 'payload',
//     getToken: getTokenFromHeader
//   }),
//   optional: jwt({
//     secret: jwtSecret,
//     userProperty: 'payload',
//     credentialsRequired: false,
//     getToken: getTokenFromHeader
//   })
// };

module.exports = {
  authLocal,
  authFacebook,
  authGoogle,
  authGithub
};
