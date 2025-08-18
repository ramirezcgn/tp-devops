import React from 'react';
import { ListGroupItem, Button } from 'reactstrap';
import cx from 'classnames';
import { Todo } from 'types/todo';
import styles from './TodoItem.module.scss';

interface Props {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoItem: React.FC<Props> = ({ todo, onToggle, onDelete }) => (
  <ListGroupItem
    className="d-flex justify-content-between align-items-center"
    color={todo.completed ? 'success' : ''}
  >
    <span
      className={cx(styles.itemStyle, { [styles.completed]: todo.completed })}
      onClick={() => onToggle(todo.id)}
      onKeyDown={({ key }) => {
        if (key === 'Enter') {
          onToggle(todo.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {todo.title}
    </span>
    <Button
      color="danger"
      size="sm"
      onClick={() => onDelete(todo.id)}
      className="ms-3"
    >
      Eliminar
    </Button>
  </ListGroupItem>
);

export default TodoItem;
