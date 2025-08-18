import { render, screen, fireEvent } from '@testing-library/react';
import TodoForm from './TodoForm';

describe('TodoForm', () => {
  it('llama a onAdd con el texto ingresado', () => {
    const onAdd = jest.fn();
    render(<TodoForm onAdd={onAdd} />);
    const input = screen.getByPlaceholderText(/nuevo todo/i);
    const button = screen.getByRole('button', { name: /agregar/i });

    fireEvent.change(input, { target: { value: 'Aprender Testing' } });
    fireEvent.click(button);

    expect(onAdd).toHaveBeenCalledWith('Aprender Testing');
    expect(input).toHaveValue('');
  });

  it('no llama a onAdd si el input está vacío', () => {
    const onAdd = jest.fn();
    render(<TodoForm onAdd={onAdd} />);
    const button = screen.getByRole('button', { name: /agregar/i });

    fireEvent.click(button);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
