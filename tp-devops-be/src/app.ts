import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
//import auth from './policies/auth.policy';
import todoRoutes from './routes/todo.routes';

// create express app
const app = express();

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

const sendResponse = (res, statusCode, response) => {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(response);
  } else if (res.end) {
    res.end(JSON.stringify(response));
  }
};

// endpoint path to monitor the service
app.get('/health', (req, res) => {
  sendResponse(res, 200, { status: 'ok' });
});

// fill routes for express application
app.use('/api/todos', todoRoutes);

// Manejo global de errores
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    //next: express.NextFunction,
  ) => {
    //console.error(err.stack || err);
    sendResponse(res, err.status || 500, {
      error: {
        message: err.message || 'Internal Server Error',
        details: err.details || undefined,
      },
    });
  },
);

// export express app
export default app;
