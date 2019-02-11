const passport = require('koa-passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const GitHubTokenStrategy = require('passport-github-token');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: GoogleTokenStrategy } = require('passport-google-token');

const User = require('../models/User');
const { oauth } = require('./index');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
      session: false
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ 'local.email': email });

        if (!user || !user.validPassword(password)) {
          return done(null, false, {
            errors: { 'email or password': 'is invalid' }
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: jwtSecret
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);

        if (!user) {
          return done(null, false);
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
); */

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: oauth.google.clientID,
      clientSecret: oauth.google.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ 'google.id': profile.id });

        if (user) {
          return done(null, user);
        }

        const newUser = new User({
          method: 'google',
          google: {
            id: profile.id,
            email: profile._json.email,
            name: profile.name.givenName
          }
        });

        await newUser.save();

        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: oauth.facebook.clientID,
      clientSecret: oauth.facebook.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ 'facebook.id': profile.id });

        if (user) {
          return done(null, user);
        }

        const newUser = new User({
          method: 'facebook',
          facebook: {
            id: profile.id,
            email: profile._json.email,
            name: profile.first_name
          }
        });

        await newUser.save();

        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

passport.use(
  new GitHubTokenStrategy(
    {
      clientID: oauth.github.clientID,
      clientSecret: oauth.github.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ 'github.id': profile.id });
        if (user) {
          return done(null, user);
        }
        const newUser = new User({
          method: 'github',
          github: {
            id: profile.id,
            email: profile._json.email,
            name: profile.name.givenName
          }
        });
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

module.exports = passport;
