import React from 'react';
import { ListGroup } from 'reactstrap';
import { Todo } from 'types/todo';
import TodoItem from '../TodoItem';

interface Props {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<Props> = ({ todos, onToggle, onDelete }) => (
  <ListGroup>
    {todos.map((todo) => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    ))}
  </ListGroup>
);

export default TodoList;
