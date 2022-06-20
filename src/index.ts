import express from 'express';
import { initSequelizeClient } from './sequelize';
import { initUsersRouter, initPostsRouter } from './routers';
import {
  initErrorRequestHandler,
  initNotFoundRequestHandler,
} from './middleware';
import dotenv from 'dotenv';
import { Dialect } from 'sequelize/dist';
const config = dotenv.config().parsed;
const PORT = 8080;

async function main(): Promise<void> {
  const app = express();

  // TODO(roman): store these credentials in some external configs
  // so that they don't end up in the git repo
  const sequelizeClient = await initSequelizeClient({
    dialect: config?.DIALECT as Dialect,
    host: config?.HOST,
    port: Number(config?.PORT),
    username: config?.USERNAME,
    password: config?.PASSWORD,
    database: config?.DATABASE,
  });

  app.use(express.json());

  app.use('/api/v1/users', initUsersRouter(sequelizeClient));
  app.use('/api/v1/posts', initPostsRouter(sequelizeClient));

  app.use('/', initNotFoundRequestHandler());

  app.use(initErrorRequestHandler());

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.info(`app listening on port: '${PORT}'`);

      resolve();
    });
  });
}

main()
  .then(() => console.info('app started'))
  .catch(console.error);
