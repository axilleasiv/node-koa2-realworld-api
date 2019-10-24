const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');

const User = require('./User');

const ArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    body: String,
    favoritesCount: { type: Number, default: 0 },
    tagList: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
  },
  { timestamps: true }
);

ArticleSchema.plugin(uniqueValidator, { message: 'is already taken' });

ArticleSchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

ArticleSchema.methods.slugify = function() {
  this.slug =
    slug(this.title) +
    '-' +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

// TODO:
ArticleSchema.methods.updateFavoriteCount = function(MockUserModel) {
  const article = this;
  const Model = MockUserModel || User;

  return Model.count({ favorites: { $in: [article._id] } }).then(function(
    count
  ) {
    article.favoritesCount = count;

    return article.save();
  });
};

ArticleSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  };
};

ArticleSchema.pre('remove', function(next) {
  this.model('Comment').deleteMany({ article: this._id }, next);
});

module.exports =
  mongoose.models.Article || mongoose.model('Article', ArticleSchema);
