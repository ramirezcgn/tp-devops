const db = {
  database: process.env.DB_NAME || 'devops',
  username: process.env.DB_USER || 'devuser',
  password: process.env.DB_PASS || 'devpass',
  host: process.env.DB_HOST || 'devops_db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
};

export default {
  development: db,
  testing: db,
  production: db,
};
