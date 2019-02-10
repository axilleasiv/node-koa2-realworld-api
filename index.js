require('dotenv').config();
const Koa = require('koa');
const logger = require('koa-logger');
const router = require('./routes');

const app = new Koa();

app.use(logger());

// error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

app.on('error', (err, ctx) => {
  console.log(err);
  /* centralized error handling:
   *   console.log error
   *   write error to log file
   *   save error and request information to database if ctx.request match condition
   *   ...
   */
});

app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(process.env.PORT);

module.exports = server;
