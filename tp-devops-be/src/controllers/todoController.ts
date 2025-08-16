import todoService from '../services/todoService';

export class TodoController {
  async create(req, res) {
    try {
      const todo = await todoService.create(req.body);
      return res.status(201).json(todo);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(req, res) {
    try {
      const page = req.query.page ? Number(req.query.page) : 0;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const todos = await todoService.getAll(page, limit);
      return res.status(200).json(todos);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async get(req, res) {
    try {
      const todo = await todoService.get(Number(req.params.id));
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      return res.status(200).json(todo);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req, res) {
    try {
      const todo = await todoService.update(Number(req.params.id), req.body);
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      return res.status(200).json(todo);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async destroy(req, res) {
    try {
      const deleted = await todoService.remove(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      return res.status(200).json({ message: 'Successfully destroyed todo' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new TodoController();
