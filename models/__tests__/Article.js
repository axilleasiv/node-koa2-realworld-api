const mongoose = require('mongoose');
const Article = require('../Article');
const User = require('../User');

const generateUser = (overrides = {}) => {
  const user = new User({
    method: 'local',
    local: {
      email: 'test@email.com'
    },
    username: 'myusername',
    bio: 'my bio is',
    image: 'http://localhost:5001/pic.jpg'
  });

  const mockOverrides = {
    save: jest.fn()
  };
  Object.assign(user, mockOverrides, overrides);

  return user;
};

const generateArticle = (overrides = {}) => {
  const MockUserModel = {
    count: jest.fn(() => Promise.resolve(MockUserModel._mockData.count)),
    _mockData: {
      count: 11
    }
  };

  const author = generateUser();
  const article = new Article({
    title: 'this is a title',
    body: 'this is the body',
    favoritesCount: 0
  });
  const mockOverrides = {
    save: jest.fn()
  };
  Object.assign(article, mockOverrides, overrides, { author });
  return { article, MockUserModel };
};

describe('Article', () => {
  test('can create a new empty article', () => {
    const article = new Article();
    expect(article.toJSON()).toEqual({
      _id: expect.any(mongoose.Types.ObjectId),
      tagList: [],
      comments: [],
      favoritesCount: 0
    });
  });

  test('generates a slug when validated', () => {
    const { article } = generateArticle({
      title: 'this is a test'
    });

    article.validate();
    expect(article.slug).toMatch('this-is-a-test-');
  });

  test('updates the favorite count via favoriters', async () => {
    const { article, MockUserModel } = generateArticle();

    await article.updateFavoriteCount(MockUserModel);
    expect(article.save).toHaveBeenCalledTimes(1);
    expect(MockUserModel.count).toHaveBeenCalledTimes(1);
    expect(MockUserModel.count).toHaveBeenCalledWith({
      favorites: {
        $in: [article._id]
      }
    });
    expect(article.favoritesCount).toBe(MockUserModel._mockData.count);
  });
});
