import Repository from './Repository';
import ToDo from '../models/ToDo';

export class ToDoRepository implements Repository {
  get(id: number) {
    return ToDo.findByPk(id);
  }

  getAll(page: number = 0, limit: number = 10) {
    return ToDo.findAll({
      limit,
      offset: page * limit,
    });
  }

  create(data: Partial<typeof ToDo>) {
    return ToDo.create({
      ...data,
    });
  }

  async update(id: number, data: Partial<typeof ToDo>) {
    await ToDo.update(data, {
      where: {
        id,
      },
    });
    return ToDo.findByPk(id);
  }

  remove(id: number) {
    return ToDo.destroy({
      where: {
        id,
      },
    });
  }
}

export default new ToDoRepository();
