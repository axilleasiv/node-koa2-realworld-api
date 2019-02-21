const request = require('supertest');
const server = require('../index.js');

const getRandomId = () => {
  return Math.random()
    .toString(36)
    .substring(2);
};
const data = {
  user: {
    email: `${getRandomId()}@email.com`,
    password: 'password',
    username: 'jane'
  }
};

beforeAll(async () => {
  console.log('Jest starting!');
});

// close the server after each test
afterAll(() => {
  server.close();
  console.log('server closed!');
});

describe('routes: users', () => {
  let res;
  let user;
  let token;

  test('POST api/users', async () => {
    res = await request(server)
      .post('/api/users')
      .send(data);

    expect(res.status).toEqual(200);
    expect(res.type).toEqual('application/json');
    expect(Object.keys(res.body.user)).toEqual(
      expect.arrayContaining(['username', 'email', 'token', 'bio', 'image'])
    );

    user = {
      email: res.body.user.email,
      password: 'password'
    };
  });

  test('POST api/users/login', async () => {
    res = await request(server)
      .post('/api/users/login')
      .send({ user });

    expect(res.status).toEqual(200);
    expect(res.type).toEqual('application/json');
    expect(Object.keys(res.body.user)).toEqual(
      expect.arrayContaining(['username', 'email', 'token', 'bio', 'image'])
    );

    token = res.body.user.token;
  });

  test('GET api/users/current', async () => {
    res = await request(server)
      .get('/api/users/current')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toEqual(200);
    expect(res.type).toEqual('application/json');
    expect(Object.keys(res.body.user)).toEqual(
      expect.arrayContaining(['username', 'email', 'token', 'bio', 'image'])
    );
  });

  test('PUT api/users/current', async () => {
    const userUpdate = {
      email: `${getRandomId()}@email.com`,
      username: getRandomId()
    };
    res = await request(server)
      .put('/api/users/current')
      .set('Authorization', `Bearer ${token}`)
      .send({ user: userUpdate });

    expect(res.status).toEqual(200);
    expect(res.type).toEqual('application/json');
    expect(Object.keys(res.body.user)).toEqual(
      expect.arrayContaining(['username', 'email', 'token', 'bio', 'image'])
    );
  });
});

describe('routes: articles', () => {
  test('GET api/articles', async () => {
    const res = await request(server).get('/api/articles');

    expect(res.status).toEqual(200);
    expect(res.type).toEqual('application/json');
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(['articles', 'articlesCount'])
    );
  });
});
