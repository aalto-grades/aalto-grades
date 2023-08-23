<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades server

## Running

<!-- TODO: Setting up a database needs a more detailed explanation -->
You will first need to start a PostgreSQL database and run migrations and
seeders on it.
```
$ npm run migration:up
$ npm run seed:up
```

Install the necessary Node modules:
```
$ npm ci
```
Compile and start the server:
```
$ npm run build
$ npm run start
```

After running the last command, the server will be available at
http://localhost:3000.

### Running in development mode

You can run the server in development mode with the command:
```
$ npm run dev
```

In development mode, the server is automatically restarted after any changes to
the code are saved.

### Running with Docker

You can also run the server and database using Docker Compose. You only need to
define the `POSTGRES_PASSWORD` with a password of your choice, and then execute
Docker Compose:
```
$ export POSTGRES_PASSWORD=XXXX
$ docker-compose up
```

This Docker Compose configuration will also start
[pgAdmin](https://www.pgadmin.org/docs/pgadmin4/7.1/index.html)
for accessing and configuring database using a browser. pgAdmin will be
available at http://localhost:5050.

Login credentials for pgAdmin:
- Email: `admin@admin.com`
- Password: `root`

From left side menu, select `Servers` and `Grades server` to access the Aalto
Grades database. If prompted, use the password `postgres` to connect.

### Sisu API

To use the routes which communicate with Sisu, the environment variables
`SISU_API_KEY` and `SISU_API_URL` must be provided. For example:
```
$ export SISU_API_KEY="your-api-key"
$ export SISU_API_URL=www.api.com/api/sisu/v1
```

Defining these variables is optional outside of the production environment.

## Tests

[Jest](https://jestjs.io/docs/getting-started) is used as the unit test
framework. Additionally, [supertest](https://www.npmjs.com/package/supertest)
is used for testing API functionality.

The easiest way to run the tests is with Docker using the Docker Compose
configuration located in this directory.

In order to run it, you must define `POSTGRES_PASSWORD` as before and set
`NODE_ENV` to `test` as follows:
```
$ export POSTGRES_PASSWORD="postgres"
$ export NODE_ENV="test"
```
Then execute Docker Compose to run the tests:
```
$ docker-compose up --abort-on-container-exit --exit-code-from backend
```
