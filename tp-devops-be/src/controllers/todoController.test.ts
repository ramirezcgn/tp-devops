import todoService from '../services/todoService';
import { TodoController } from './todoController';

jest.mock('../services/todoService');

const mockReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
});

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('TodoController', () => {
  let controller: TodoController;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    controller = new TodoController();
    jest.clearAllMocks();
  });

  test('create - success', async () => {
    const req = mockReq({ title: 'Test' });
    const res = mockRes();
    (todoService.create as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'Test',
    });

    await controller.create(req as any, res as any);

    expect(todoService.create).toHaveBeenCalledWith({ title: 'Test' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Test' });
  });

  test('getAll - success', async () => {
    const req = mockReq({}, {}, { page: '1', limit: '2' });
    const res = mockRes();
    (todoService.getAll as jest.Mock).mockResolvedValue([{ id: 1 }]);

    await controller.getAll(req as any, res as any);

    expect(todoService.getAll).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('get - found', async () => {
    const req = mockReq({}, { id: '1' });
    const res = mockRes();
    (todoService.get as jest.Mock).mockResolvedValue({ id: 1 });

    await controller.get(req as any, res as any);

    expect(todoService.get).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  test('get - not found', async () => {
    const req = mockReq({}, { id: '2' });
    const res = mockRes();
    (todoService.get as jest.Mock).mockResolvedValue(null);

    await controller.get(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Todo not found' });
  });

  test('update - success', async () => {
    const req = mockReq({ title: 'Nuevo' }, { id: '1' });
    const res = mockRes();
    (todoService.update as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'Nuevo',
    });

    await controller.update(req as any, res as any);

    expect(todoService.update).toHaveBeenCalledWith(1, { title: 'Nuevo' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1, title: 'Nuevo' });
  });

  test('update - not found', async () => {
    const req = mockReq({ title: 'Nuevo' }, { id: '2' });
    const res = mockRes();
    (todoService.update as jest.Mock).mockResolvedValue(null);

    await controller.update(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Todo not found' });
  });

  test('destroy - success', async () => {
    const req = mockReq({}, { id: '1' });
    const res = mockRes();
    (todoService.remove as jest.Mock).mockResolvedValue(true);

    await controller.destroy(req as any, res as any);

    expect(todoService.remove).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Successfully destroyed todo',
    });
  });

  test('destroy - not found', async () => {
    const req = mockReq({}, { id: '2' });
    const res = mockRes();
    (todoService.remove as jest.Mock).mockResolvedValue(false);

    await controller.destroy(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Todo not found' });
  });

  test('create - error', async () => {
    const req = mockReq({ title: 'Test' });
    const res = mockRes();
    (todoService.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    await controller.create(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  test('getAll - error', async () => {
    const req = mockReq({}, {}, { page: '1', limit: '2' });
    const res = mockRes();
    (todoService.getAll as jest.Mock).mockRejectedValue(new Error('DB error'));

    await controller.getAll(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  test('get - error', async () => {
    const req = mockReq({}, { id: '1' });
    const res = mockRes();
    (todoService.get as jest.Mock).mockRejectedValue(new Error('DB error'));

    await controller.get(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  test('update - error', async () => {
    const req = mockReq({ title: 'Nuevo' }, { id: '1' });
    const res = mockRes();
    (todoService.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    await controller.update(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  test('destroy - error', async () => {
    const req = mockReq({}, { id: '1' });
    const res = mockRes();
    (todoService.remove as jest.Mock).mockRejectedValue(new Error('DB error'));

    await controller.destroy(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
