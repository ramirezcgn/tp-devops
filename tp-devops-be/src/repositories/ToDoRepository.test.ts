import todoRepository from './ToDoRepository';
import ToDo from '../models/ToDo';

jest.mock('../models/ToDo');

describe('ToDoRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('get debe llamar a ToDo.findAll con el id correcto', () => {
    (ToDo.findAll as jest.Mock).mockResolvedValue([{ id: 1, title: 'Test' }]);
    todoRepository.getAll();
    expect(ToDo.findAll).toHaveBeenCalled();
  });

  test('get debe llamar a ToDo.findByPk con el id correcto', () => {
    (ToDo.findByPk as jest.Mock).mockResolvedValue({ id: 1, title: 'Test' });
    todoRepository.get(1);
    expect(ToDo.findByPk).toHaveBeenCalledWith(1);
  });

  test('update debe llamar a ToDo.update y luego a ToDo.findByPk', async () => {
    (ToDo.update as jest.Mock).mockResolvedValue([1]);
    (ToDo.findByPk as jest.Mock).mockResolvedValue({ id: 1, title: 'Updated' });

    const result = await todoRepository.update(1, { title: 'Updated' });

    expect(ToDo.update).toHaveBeenCalledWith(
      {
        title: 'Updated',
      },
      {
        where: { id: 1 },
      },
    );
    expect(ToDo.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, title: 'Updated' });
  });

  test('remove debe llamar a ToDo.destroy con el id correcto', () => {
    (ToDo.destroy as jest.Mock).mockResolvedValue(1);
    todoRepository.remove(1);
    expect(ToDo.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
