require('dotenv').config();
const Koa = require('koa');
const logger = require('koa-logger');
const helmet = require('koa-helmet');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');

const router = require('./routes');
const { errorHandler } = require('./middlewares');
const { trackErrors } = require('./helpers');
const { connectDb } = require('./models');
const passport = require('./config/passport');

const app = new Koa();

app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
  app.use(logger());
}

connectDb().then(async () => {
  // await createDummyData();
  console.log('==> DB ready');
});

app.use(bodyParser());
app.use(cors());

app.use(passport.initialize());

app.use(serve(path.join(__dirname, './public')));

app.use(errorHandler);
trackErrors(app);

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 9999;
const server = app.listen(port, () =>
  console.log(`\nlistening on port: ${port}`)
);

module.exports = server;
