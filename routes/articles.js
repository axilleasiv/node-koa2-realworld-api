const Router = require('koa-router');
const Article = require('../models/Article');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { authJWT } = require('../config/auth');

const router = Router();

router.post('/articles', authJWT.required, async (ctx, next) => {
  const user = await User.findById(ctx.state.user.id);

  if (!user) return (ctx.status = 404);

  const article = new Article(ctx.request.body.article);

  article.author = user;

  await article.save();

  ctx.body = { article: article.toJSONFor(user) };
});

router.get('/articles', authJWT.optional, async (ctx, next) => {
  let query = {};
  let limit = 20;
  let offset = 0;

  const req = ctx.request;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== 'undefined') {
    query.tagList = { $in: [req.query.tag] };
  }

  const author = req.query.author
    ? await User.findOne({ username: req.query.author })
    : null;

  const favoriter = req.query.favorited
    ? await User.findOne({ username: req.query.favorited })
    : null;

  if (author) {
    query.author = author._id;
  }

  if (favoriter) {
    query._id = { $in: favoriter.favorites };
  } else if (req.query.favorited) {
    query._id = { $in: [] };
  }

  const articles = await Article.find(query)
    .limit(Number(limit))
    .skip(Number(offset))
    .sort({ createdAt: 'desc' })
    .populate('author');
  const articlesCount = await Article.count(query);
  const authUser = ctx.state.user
    ? await User.findById(ctx.state.user.id)
    : null;

  ctx.body = {
    articles: articles.map(article => article.toJSONFor(authUser)),
    articlesCount
  };
});

router.get('/articles/feed', authJWT.required, async (ctx, next) => {
  let limit = 20;
  let offset = 0;

  const req = ctx.request;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  const user = await User.findById(ctx.state.user.id);

  if (!user) {
    return (ctx.status = 401);
  }

  const articles = await Article.find({ author: { $in: user.following } })
    .limit(Number(limit))
    .skip(Number(offset))
    .populate('author');
  const articlesCount = await Article.count({
    author: { $in: user.following }
  });

  ctx.body = {
    articles: articles.map(article => article.toJSONFor(user)),
    articlesCount
  };
});

router.param('article', async (slug, ctx, next) => {
  const article = await Article.findOne({ slug }).populate('author');

  if (!article) return (ctx.status = 404);

  ctx.state.article = article;

  return next();
});

// return a article
router.get('/articles/:article', authJWT.optional, async (ctx, next) => {
  const user = ctx.state.user ? await User.findById(ctx.state.user.id) : null;

  ctx.body = { article: ctx.state.article.toJSONFor(user) };
});

// update article
router.put('/articles/:article', authJWT.required, async (ctx, next) => {
  const user = await User.findById(ctx.state.user.id);
  const { article: newArticle } = ctx.request.body;
  let { article } = ctx.state;

  if (article.author._id.toString() === ctx.state.user.id.toString()) {
    if (typeof newArticle.title !== 'undefined') {
      article.title = newArticle.title;
    }

    if (typeof newArticle.description !== 'undefined') {
      article.description = newArticle.description;
    }

    if (typeof newArticle.body !== 'undefined') {
      article.body = newArticle.body;
    }

    if (typeof newArticle.tagList !== 'undefined') {
      article.tagList = newArticle.tagList;
    }

    article = await article.save();

    ctx.body = { article: article.toJSONFor(user) };
  } else {
    return (ctx.status = 403);
  }
});

// delete article
router.delete('/articles/:article', authJWT.required, async (ctx, next) => {
  const { user } = ctx.state;
  const forUser = await User.findById(ctx.state.user.id);

  if (!forUser) {
    return (ctx.status = 401);
  }

  const { article } = ctx.state;

  if (article.author._id.toString() === user.id.toString()) {
    await article.remove();
    return (ctx.status = 204);
  } else {
    return (ctx.status = 403);
  }
});

// Favorite an article
router.post(
  '/articles/:article/favorite',
  authJWT.required,
  async (ctx, next) => {
    let { article } = ctx.state;
    const user = await User.findById(ctx.state.user.id);

    if (!user) {
      return (ctx.status = 401);
    }

    await user.favorite(article._id);
    article = await article.updateFavoriteCount();

    ctx.body = { article: article.toJSONFor(user) };
  }
);

// Unfavorite an article
router.delete(
  '/articles/:article/favorite',
  authJWT.required,
  async (ctx, next) => {
    let { article, user } = ctx.state;
    const forUser = await User.findById(user.id);

    if (!forUser) {
      return (ctx.status = 401);
    }

    await forUser.unfavorite(article._id);
    article = await article.updateFavoriteCount();

    ctx.body = { article: article.toJSONFor(forUser) };
  }
);

router.param('comment', async (id, ctx, next) => {
  const comment = await Comment.findById(id);

  if (!comment) {
    return (ctx.status = 404);
  }

  ctx.state.comment = comment;

  return next();
});

// create a new comment
router.post(
  '/articles/:article/comments',
  authJWT.required,
  async (ctx, next) => {
    const { article, user } = ctx.state;
    const forUser = await User.findById(user.id);

    if (!forUser) {
      return (ctx.status = 404);
    }

    const comment = new Comment(ctx.request.body.comment);
    comment.article = ctx.state.article;
    comment.author = forUser;

    await comment.save();

    article.comments.push(comment);
    await article.save();

    ctx.body = { comment: comment.toJSONFor(forUser) };
  }
);

// return an article's comments
router.get(
  '/articles/:article/comments',
  authJWT.optional,
  async (ctx, next) => {
    const { user, article } = ctx.state;
    const forUser = user ? await User.findById(user.id) : null;

    await article
      .populate({
        path: 'comments',
        populate: {
          path: 'author'
        },
        options: {
          sort: {
            createdAt: 'desc'
          }
        }
      })
      .execPopulate();

    const comments = article.comments.map(comment =>
      comment.toJSONFor(forUser)
    );

    ctx.body = { comments };
  }
);

router.delete(
  '/articles/:article/comments/:comment',
  authJWT.required,
  async (ctx, next) => {
    const { comment, article, user } = ctx.state;

    if (comment.author.toString() === user.id.toString()) {
      article.comments.remove(comment._id);
      await article.save();
      await Comment.find({ _id: comment._id }).remove();

      return (ctx.status = 204);
    } else {
      return (ctx.status = 403);
    }
  }
);

module.exports = router.routes();
