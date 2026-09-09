const request = require('supertest');
const app = require('../src/app');

describe('Storefront API', () => {
  test('returns health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });

  test('rejects invalid registration data', async () => {
    const response = await request(app).post('/api/auth/register').send({ name: 'A', email: 'invalid', password: 'short' });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('protects cart routes without a token', async () => {
    const response = await request(app).get('/api/cart');
    expect(response.status).toBe(401);
  });
});