import app from './app';
import config from './config';
import dbService from './services/dbService';
import seeder from './config/seeds';

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV || 'development';

// list all available endpoints
async function startServer() {
  try {
    await dbService(environment, config.migrate, seeder).start();
    app.listen(config.port, () => {
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
