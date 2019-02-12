const Router = require('koa-router');
const Article = require('../models/Article');

const router = Router();

// return a list of tags
router.get('/tags', async (ctx, next) => {
  const tags = await Article.find().distinct('tagList');

  ctx.body = { tags };
});

module.exports = router.routes();
