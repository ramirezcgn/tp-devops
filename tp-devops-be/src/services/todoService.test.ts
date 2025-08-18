import todoRepository from '../repositories/ToDoRepository';
import todoService from './todoService';

jest.mock('../repositories/ToDoRepository');

describe('todoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('get debe delegar en ToDoRepository.get', async () => {
    (todoRepository.get as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'Test',
    } as any);
    const result = await todoService.get(1);
    expect(todoRepository.get).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, title: 'Test' });
  });

  test('update debe delegar en ToDoRepository.update', async () => {
    (todoRepository.update as jest.Mock).mockReturnValue(1 as any);
    const result = await todoService.update(1, { title: 'Updated' });
    expect(todoRepository.update).toHaveBeenCalledWith(1, { title: 'Updated' });
    expect(result).toBe(1);
  });

  test('remove debe delegar en ToDoRepository.remove', async () => {
    (todoRepository.remove as jest.Mock).mockReturnValue(1 as any);
    const result = await todoService.remove(1);
    expect(todoRepository.remove).toHaveBeenCalledWith(1);
    expect(result).toBe(1);
  });
});
