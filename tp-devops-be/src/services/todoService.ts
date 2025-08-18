import toDoRepository from '../repositories/ToDoRepository';

export class ToDoService {
  get(id) {
    return toDoRepository.get(id);
  }

  getAll(page, limit) {
    return toDoRepository.getAll(page, limit);
  }

  create(data) {
    return toDoRepository.create(data);
  }

  update(id, data) {
    return toDoRepository.update(id, data);
  }

  remove(id) {
    return toDoRepository.remove(id);
  }
}

export default new ToDoService();
