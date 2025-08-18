'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import { Todo } from 'types/todo';
import { TodoForm, TodoList, FeedbackAlert } from 'components';
import * as todoService from 'services/todoService';

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    color: 'success' | 'danger';
    message: string;
  }>({ color: 'success', message: '' });

  useEffect(() => {
    todoService
      .getTodos()
      .then(setTodos)
      .catch(() =>
        setFeedback({
          color: 'danger',
          message: 'Error al cargar los elementos.',
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async (title: string) => {
    try {
      const newTodo = await todoService.addTodo(title);
      setTodos((prev) => [...prev, newTodo]);
      setFeedback({ color: 'success', message: '¡Todo agregado!' });
    } catch {
      setFeedback({
        color: 'danger',
        message: 'Error al agregar el elemento.',
      });
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;
      const updated = await todoService.updateTodo({
        ...todo,
        completed: !todo.completed,
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setFeedback({ color: 'success', message: '¡Todo actualizado!' });
    } catch {
      setFeedback({
        color: 'danger',
        message: 'Error al actualizar el elemento.',
      });
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setFeedback({ color: 'success', message: '¡Todo eliminado!' });
    } catch {
      setFeedback({
        color: 'danger',
        message: 'Error al eliminar el elemento.',
      });
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <CardBody>
              <CardTitle tag="h2" className="mb-4 text-center">
                Todo App
              </CardTitle>
              <FeedbackAlert
                color={feedback.color}
                message={feedback.message}
                onClose={() => setFeedback({ ...feedback, message: '' })}
              />
              <TodoForm onAdd={addTodo} />
              <TodoList
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
