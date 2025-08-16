import ToDo from '../../models/ToDo';

export default () =>
  ToDo.bulkCreate(
    [
      {
        title: 'First ToDo',
        description: 'This is the first ToDo',
        completed: false,
      },
      {
        title: 'Second ToDo',
        description: 'This is the second ToDo',
        completed: false,
      },
    ],
    {
      fields: ['title', 'description', 'completed'],
      ignoreDuplicates: true,
    },
  );
