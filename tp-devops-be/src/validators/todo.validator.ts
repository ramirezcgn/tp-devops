import { body, param, query } from 'express-validator';

export const createTodoValidator = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required'),
];

export const updateTodoValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
  body('title').optional().isString().withMessage('Title must be a string'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
];

export const getTodoValidator = [
  param('id').isInt().withMessage('ID must be an integer'),
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive integer'),
];
