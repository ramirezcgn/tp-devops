import ToDoRepository from '../repositories/ToDoRepository';

const todo = new ToDoRepository();

class ToDoService {
  get(id) {
    return todo.get(id);
  }

  getAll(page, limit) {
    return todo.getAll(page, limit);
  }

  create(data) {
    return todo.create(data);
  }

  update(id, data) {
    return todo.update(id, data);
  }

  remove(id) {
    return todo.remove(id);
  }
}

export default new ToDoService();
