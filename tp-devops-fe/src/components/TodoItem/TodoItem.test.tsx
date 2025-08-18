import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from './TodoItem';

const todo = { id: 1, title: 'Test Todo', completed: false };

describe('TodoItem', () => {
  it('muestra el título', () => {
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('llama a onToggle al hacer click en el título', () => {
    const onToggle = jest.fn();
    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={() => {}} />);
    fireEvent.click(screen.getByText('Test Todo'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('llama a onDelete al hacer click en el botón', () => {
    const onDelete = jest.fn();
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Eliminar'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
