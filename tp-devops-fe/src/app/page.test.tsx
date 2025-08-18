import { render, screen, waitFor } from '@testing-library/react';
import HomePage from './page';

jest.mock('../services/todoService', () => ({
  getTodos: jest.fn().mockResolvedValue([]),
  addTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
}));

describe('HomePage', () => {
  it('renderiza el título principal', async () => {
    render(<HomePage />);
    // Espera a que el heading aparezca después de los efectos
    await waitFor(() => {
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });
  });
});
