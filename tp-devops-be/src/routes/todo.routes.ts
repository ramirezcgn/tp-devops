import { Router } from 'express';
import todoController from '../controllers/todoController';
import {
  createTodoValidator,
  updateTodoValidator,
  getTodoValidator,
  paginationValidator,
} from '../validators/todo.validator';
import { validate } from '../validators/validate';

const router = Router();

router.get('/', paginationValidator, validate, todoController.getAll);
router.get('/:id', getTodoValidator, validate, todoController.get);
router.post('/', createTodoValidator, validate, todoController.create);
router.put('/:id', updateTodoValidator, validate, todoController.update);
router.delete('/:id', getTodoValidator, validate, todoController.destroy);

export default router;
