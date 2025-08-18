import { render, screen } from '@testing-library/react';
import TodoList from './TodoList';

const todos = [
  { id: 1, title: 'Test 1', completed: false },
  { id: 2, title: 'Test 2', completed: true },
];

describe('TodoList', () => {
  it('muestra todos los elementos', () => {
    render(<TodoList todos={todos} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
  });
});
