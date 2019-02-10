const request = require('supertest');
const server = require('../index.js');

beforeAll(async () => {
  console.log('Jest starting!');
});

// close the server after each test
afterAll(() => {
  server.close();
  console.log('server closed!');
});

describe('basic route tests', () => {
  test('get home route GET api/users/current', async () => {
    const response = await request(server).get('/api/users/current');
    expect(response.status).toEqual(200);
    expect(response.text).toContain('');
  });
});
