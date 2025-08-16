/**
 * third party libraries
 */
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import cors from 'cors';

/**
 * server configuration
 */
import config from './config';
import seeder from './config/seeds';
import dbService from './services/dbService';
//import auth from './policies/auth.policy';
import todoRoutes from './routes/todo.routes';

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV || 'development';

/**
 * express application
 */
const app = express();
const server = new http.Server(app);

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// secure express app
app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false,
  }),
);

// parsing the request body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// secure your private routes with jwt authentication middleware
// app.all('/api/admin/*', (req, res, next) => auth(req, res, next));

// fill routes for express application
app.use('/api/todos', todoRoutes);

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: err.details || undefined,
    },
  });
});

// list all available endpoints
async function startServer() {
  try {
    await dbService(environment, config.migrate, seeder).start();

    server.listen(config.port, () => {
      if (!['production', 'development', 'testing'].includes(environment)) {
        console.error(
          `NODE_ENV is set to ${environment}, but only production and development are valid.`,
        );
        process.exit(1);
      }
      const url = `http://localhost:${config.port}`;
      console.log(`\nAPI Server is running at: \x1b[32m${url}\x1b[0m\n`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

startServer();
