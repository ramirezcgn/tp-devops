import { getTodos, addTodo, updateTodo, deleteTodo } from './todoService';
import { Todo } from 'types/todo';

const mockTodos: Todo[] = [{ id: 1, title: 'Test', completed: false }];

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('todoService', () => {
  describe('getTodos', () => {
    it('devuelve la lista de todos si la respuesta es ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTodos,
      });
      const result = await getTodos();
      expect(result).toEqual(mockTodos);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos'),
      );
    });

    it('lanza error si la respuesta no es ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Error' }),
      });
      await expect(getTodos()).rejects.toThrow('Error');
    });
  });

  describe('addTodo', () => {
    it('devuelve el todo creado si la respuesta es ok', async () => {
      const newTodo = { id: 2, title: 'Nuevo', completed: false };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => newTodo,
      });
      const result = await addTodo('Nuevo');
      expect(result).toEqual(newTodo);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'Nuevo' }),
        }),
      );
    });

    it('lanza error si la respuesta no es ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Error al crear' }),
      });
      await expect(addTodo('Nuevo')).rejects.toThrow('Error al crear');
    });
  });

  describe('updateTodo', () => {
    it('devuelve el todo actualizado si la respuesta es ok', async () => {
      const updated = { id: 1, title: 'Actualizado', completed: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => updated,
      });
      const result = await updateTodo(updated);
      expect(result).toEqual(updated);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updated),
        }),
      );
    });

    it('lanza error si la respuesta no es ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Error al actualizar' }),
      });
      await expect(updateTodo(mockTodos[0])).rejects.toThrow(
        'Error al actualizar',
      );
    });
  });

  describe('deleteTodo', () => {
    it('no lanza error si la respuesta es ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
      await expect(deleteTodo(1)).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('lanza error si la respuesta no es ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Error al eliminar' }),
      });
      await expect(deleteTodo(1)).rejects.toThrow('Error al eliminar');
    });
  });
});
