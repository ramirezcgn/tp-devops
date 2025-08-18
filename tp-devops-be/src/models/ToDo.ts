import Sequelize from 'sequelize';
import sequelize from '../config/database';

const tableName = 'todos';

const ToDo = sequelize.define(
  'ToDo',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
    },
    completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName },
);

export default ToDo;
