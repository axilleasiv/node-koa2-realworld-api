const mongoose = require('mongoose');

const User = require('./User');
const Article = require('./Article');
const Comment = require('./Comment');

const connectDb = () => {
  if (!process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }

  return mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
  });
};

const models = { User, Article, Comment };

module.exports = {
  connectDb,
  models
};
