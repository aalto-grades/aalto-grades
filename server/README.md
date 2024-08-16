<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades server

## Running

### Setting up the database

> If the command `npm install` fails on Apple Silicon, check that there are NO spaces in the folder path

#### Running postgreSQL (and pgAdmin) with docker

For development purposes, you can easily run the database and pgadmin in docker
and then start node server locally in development mode.

Start the postgreSQL and pgadmin:

```
docker compose up database pgadmin
```

pgAdmin will be available at http://localhost:5050.

When you are done with these stop the container and run:

```
docker compose down --remove-orphans
```

to remove containers.

#### Running the migrations and the seed

copy `.env.example` to `.env`:

```
cp .env.example .env
```

Install the packages:

```
npm i
```

Build the server to be able to run the migrations and the seed:

```
npm run build
```

Run migrations and seeder:

```
npm run migration:up
npm run seed:up
```

### Running the server

Start the server:

```
npm run dev
```

The backend will be available at http://localhost:3000.

### Running with Docker

You can also run the server and database using Docker:

```
docker compose up
```

### pgAdmin

The Docker Compose configuration will also start
[pgAdmin](https://www.pgadmin.org/docs/pgadmin4/latest/index.html)
for accessing and configuring database using a browser. pgAdmin will be
available at http://localhost:5050.

Login credentials for pgAdmin:

- Email: `admin@aalto.fi`
- Password: `password`

From left side menu, select `Servers` and `Grades server` to access the Aalto
Grades database. If prompted, use the password `postgres` to connect.

## Tests

[Jest](https://jestjs.io/docs/getting-started) is used as the unit test
framework. Additionally, [supertest](https://www.npmjs.com/package/supertest)
is used for testing API functionality.

The easiest way to run the tests is with Docker using the Docker Compose
configuration located in this directory.

Execute Docker Compose to run the tests:

```
docker compose -f docker-compose-test.yaml up --abort-on-container-exit --exit-code-from backend
```
