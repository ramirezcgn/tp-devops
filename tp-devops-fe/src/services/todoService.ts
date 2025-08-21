import { Todo } from 'types/todo';

const API_SCHEMA =
  process.env.BE_SCHEMA || process.env.NEXT_PUBLIC_BE_SCHEMA || 'http';
const API_HOST =
  process.env.BE_HOST || process.env.NEXT_PUBLIC_BE_HOST || 'localhost';
const API_PORT =
  process.env.BE_PORT || process.env.NEXT_PUBLIC_BE_PORT || '3001';
const API_URL = `${API_SCHEMA}://${API_HOST}:${API_PORT}/api/todos`;

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    let errorMsg = 'Error en la comunicación con el servidor';
    try {
      const data = await res.json();
      errorMsg = data.message || data.error?.message || errorMsg;
    } catch {
      // Si no es JSON, ignora
    }
    throw new Error(errorMsg);
  }
  return res.json();
};

export const getTodos = async (): Promise<Todo[]> => {
  const res = await fetch(API_URL);
  return handleResponse(res);
};

export const addTodo = async (title: string): Promise<Todo> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse(res);
};

export const updateTodo = async (todo: Todo): Promise<Todo> => {
  const res = await fetch(`${API_URL}/${todo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  return handleResponse(res);
};

export const deleteTodo = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    let errorMsg = 'Error al eliminar el elemento';
    try {
      const data = await res.json();
      errorMsg = data.message || data.error?.message || errorMsg;
    } catch {
      // Si no es JSON, ignora
    }
    throw new Error(errorMsg);
  }
};
