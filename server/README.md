<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades backend

## Table of Contents

- [Running the server](#running-the-server)
  - [Development locally](#development-locally)
  - [Sisu API](#sisu-api)
- [Migrations](#migrations)
- [Seeds](#seeds)

## Running the server

Install the necessary Node.js modules:
```
$ npm ci
```
Compile and start the server:
```
$ npm run build
$ npm run start
```

After running the last command, server is available at http://localhost:3000.

### Development locally

You can run the server in local development mode with command:
```
npm run dev
```

In development mode, after any changes to the code are saved, server is automatically restarted.

It is possible to set environment variables to `.env` file  in the server directory root.
See `.env.example` file for variable list, rename to `.env` before running server.

### Run with docker

You can also run locally with docker-compose. Before running,
set environment variable `POSTGRES_PASSWORD` and `NODE_ENV`, following:
```
$ export POSTGRES_PASSWORD="postgres"
$ export NODE_ENV="test"
```

Execute Docker Compose:
```
docker-compose --profile development up
```

Backend server will be made available on address http://localhost:3000.

This will also launch [pgAdmin](https://www.pgadmin.org/docs/pgadmin4/7.1/index.html)
for accessing and configuring database using browser. pgAdmin will be accessible from http://localhost:5050.

Login credentials for pgAdmin:
- Email: `admin@admin.com`
- Password: `root`

From left side menu select `Servers` and `Grades server` to access the grades database.
If prompted, use the password `postgres` to connect.

### Sisu API

To use the routes that communicate with Sisu, the environment variables `SISU_API_KEY` 
and `SISU_API_URL` must be provided. These are optional when not in production environment.

For an example:
```
$ export SISU_API_KEY="your-api-key"
$ export SISU_API_URL=www.api.com/api/sisu/v1
```

## Migrations

Migrations to keep track of changes to the database. With migrations
you can transfer existing database into another state and vice versa.
Those state transitions are saved in migration files, which describe
how to get to the new state and how to revert the changes in order
to get back to the old state.

Run database migrations all the way to latest one:
```
$ npm run migration:up
```

Run one migration down:
```
$ npm run migration:down
```

Run all migrations down:
```
$ npm run migration:down:all
```

Migrations utilize the Sequelize [Command Line Interface](https://github.com/sequelize/cli).
The database which CLI will connect is defined in `/src/configs/database.ts`,
more information on options [here](https://github.com/sequelize/cli/blob/main/docs/README.md).
Detailed information about migrations in the Sequelize
[documentation](https://sequelize.org/docs/v6/other-topics/migrations/).

Migration, seeder, config and model paths are defined in `.sequelizerc`.

Migration files are placed in `/src/database/migrations`.
Migration files are named with ascending numbering and name describing
the actions migration does to the database state. For an example:
```
00001-initial-migration.ts
00002-add-indexes.ts
```

Use the example below as a template for creating new migration.
`up` property should run the new migration to the database, `down` property
should undo the changes `up` creates.

```typescript
// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { QueryInterface, Transaction } from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // Use transactions if running multiple changes to the database in one migration.
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'table_name', 'column_name',
        { type: DataTypes.INTEGER, allowNull: false },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        'table_name', 'column_name', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
```

## Seeds

To manage data migrations to the database, you can use seeders.
Seed files include the data you want populate the database with (sample or test data).

Seeder files are placed in `/src/database/seeders`.
Seeder files are named with ascending numbering and name describing
the actions seeder does to the database state. For an example:
```
001-load-test-data.ts
002-add-more-data-points.ts
```

Run seeder files all the way to latest one:
```
$ npm run seed:up
```

Run one seeder file down (delete the populated data from database for that seeder):
```
$ npm run seed:down
```

## Unit tests

[Jest](https://jestjs.io/docs/getting-started) is used as the unit test
framework. Additionally, [supertest](https://www.npmjs.com/package/supertest)
is used for testing API functionality.

The easiest way to run unit tests is with the Docker Compose located at this
directory. In order to run it, define a PostgreSQL password and node environment
in the environment variable `POSTGRES_PASSWORD` and `NODE_ENV` as follows:
```
$ export POSTGRES_PASSWORD="postgres"
$ export NODE_ENV="test"
```
Execute Docker Compose:
```
$ docker-compose up --abort-on-container-exit --exit-code-from backend
```
This Docker Compose creates an environment where backend tests can be executed
against a PostgreSQL instance running in a container.

## API Documentation

API documentation written with the OpenAPI spec and displayed by Swagger can
be found from the path
```
<backend-url>/api-docs/
```

For more information about the OpenAPI spec:

https://swagger.io/docs/specification/about/
