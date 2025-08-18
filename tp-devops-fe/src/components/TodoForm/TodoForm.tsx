import React, { useState } from 'react';
import { Input, Button, Form, FormGroup, Row, Col } from 'reactstrap';

interface Props {
  onAdd: (title: string) => void;
}

const TodoForm: React.FC<Props> = ({ onAdd }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
    setTitle('');
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <FormGroup>
        <Row>
          <Col xs={9}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nuevo todo"
            />
          </Col>
          <Col xs={3}>
            <Button color="primary" type="submit" block>
              Agregar
            </Button>
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default TodoForm;
