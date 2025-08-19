import request from 'supertest';
import app from './app';

jest.mock('./models/ToDo', () => ({
  findAll: jest
    .fn()
    .mockResolvedValue([{ id: 1, title: 'Test todo', completed: false }]),
  create: jest
    .fn()
    .mockResolvedValue({ id: 2, title: 'Test todo', completed: false }),
}));

describe('API /api/todos', () => {
  test('GET /api/todos should return 200 and an array', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Accept', 'application/json')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/todos should create a todo', async () => {
    const todoData = { title: 'Test todo' };
    const res = await request(app)
      .post('/api/todos')
      .send(todoData)
      .set('Accept', 'application/json')
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(todoData.title);
  });

  describe('GET /health', () => {
    it('debe responder con status 200 y { status: "ok" }', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });
});
