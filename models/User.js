const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config');

const UserSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['local', 'google', 'facebook', 'github'],
      required: true
    },
    local: {
      email: {
        type: String,
        lowercase: true,
        // match: [/\S+@\S+\.\S+/, 'is invalid'],
        unique: true,
        sparse: true
      },
      hash: String,
      salt: String
    },
    google: {
      email: {
        type: String,
        lowercase: true,
        unique: true,
        sparse: true
      },
      name: {
        type: String
      },
      id: {
        type: String
      }
    },
    facebook: {
      email: {
        type: String,
        lowercase: true,
        unique: true,
        sparse: true
      },
      name: {
        type: String
      },
      id: {
        type: String
      }
    },
    github: {
      email: {
        type: String,
        lowercase: true,
        unique: true,
        sparse: true
      },
      name: {
        type: String
      },
      id: {
        type: String
      }
    },
    username: {
      type: String,
      lowercase: true
      // match: [/^[a-zA-Z0-9]+$/, 'is invalid']
    },
    bio: String,
    image: String,
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }]
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.pre('save', async function(next) {
  try {
    if (this.method === 'local') {
      await this.setPassword(this.local.hash);
    } else {
      // TODO:
      this.username = this[this.method].email.split('@')[0];
    }
  } catch (error) {
    next(error);
  }

  next();
});

UserSchema.methods.setPassword = function(password) {
  this.local.salt = crypto.randomBytes(16).toString('hex');
  this.local.hash = crypto
    .pbkdf2Sync(password, this.local.salt, 10000, 512, 'sha512')
    .toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.local.salt, 10000, 512, 'sha512')
    .toString('hex');
  return this.local.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000)
    },
    jwtSecret
  );
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this[this.method].email,
    token: this.generateJWT(),
    bio: this.bio || '',
    image: this.image || 'http://localhost:5001/pic.jpg'
  };
};

UserSchema.methods.toProfileJSONFor = function(user) {
  return {
    username: this.username,
    bio: this.bio,
    image:
      this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user ? user.isFollowing(this._id) : false
  };
};

UserSchema.methods.follow = function(id) {
  if (this.following.indexOf(id) === -1) {
    this.following.push(id);
  }

  return this.save();
};

UserSchema.methods.unfollow = function(id) {
  this.following.remove(id);
  return this.save();
};

UserSchema.methods.isFollowing = function(id) {
  return this.following.some(followId => followId.toString() === id.toString());
};

UserSchema.methods.favorite = function(id) {
  if (!this.favorites.includes(id)) {
    this.favorites.push(id);
  }

  return this.save();
};

UserSchema.methods.unfavorite = function(id) {
  this.favorites.remove(id);
  return this.save();
};

UserSchema.methods.isFavorite = function(id) {
  return this.favorites.some(
    favoriteId => favoriteId.toString() === id.toString()
  );
};

UserSchema.pre('remove', function(next) {
  this.model('Article').deleteMany({ author: this._id }, next);
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
