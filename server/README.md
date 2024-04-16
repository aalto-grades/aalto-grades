<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades server

## Running

### Running on local environment

<!-- TODO: Setting up a database needs a more detailed explanation -->

> If the command `npm install` fails on Apple Silicon, check that there are NO spaces in the folder path

#### Running postgreSQL and pgAdmin with docker

For development purposes, you can easily run the database and pgadmin in docker
and then start node server locally in development mode.

Set the following environment variables:

```
$ export POSTGRES_PASSWORD=postgres

```

Start the postgreSQL and pgadmin:

```
$ docker compose up database pgadmin
```

pgAdmin will be
available at http://localhost:5050.

You can now setup the node environment by following the instructions and to start e.g.
the development server to start developing.

When you are done with these stop the container and run:

```
$ docker compose down --remove-orphans
```

to remove containers and network

#### Setting up local node environment

In a `.env` file setup the node env variables (.env.example included as an example)

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=postgres
POSTGRES_URL=localhost
```

Install the necessary Node modules:

```
$ npm ci
```

Build the server:

```
$ npm run build
```

Run migrations and seeder:

```
$ npm run migration:up
$ npm run seed:up
```

### Running the server

Start the server:

```
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
$ docker compose up
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

Execute Docker Compose to run the tests:

```
$ docker compose -f docker-compose-test.yaml up --abort-on-container-exit --exit-code-from backend
```
