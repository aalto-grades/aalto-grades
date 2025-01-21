<!--
SPDX-FileCopyrightText: 2022 The Ossi Developers

SPDX-License-Identifier: MIT
-->

# Ossi server

## Running

### Setting up the database

#### Running the database (and pgAdmin) with Docker

For development purposes, you can easily run the database and pgAdmin in Docker
and then start Node server locally in development mode.

Start the database and pgAdmin:

```
docker compose up database pgadmin
```

When you are done run the following command to remove the containers:

```
docker compose down --remove-orphans
```

#### Running the migrations and seeder

> If the command `npm i` fails on Apple Silicon, check that there are NO spaces
> in the folder path

Install the packages:

```
npm i
```

Also install the packages in the common folder

```
npm i --prefix ../common
```

Build the server to be able to run the migrations and seeder:

```
npm run build
```

Run the migrations and seeder:

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

You can also run both the server and database using Docker simultaneously:

```
docker compose up
```

### pgAdmin

The Docker Compose configuration will also start
[pgAdmin](https://www.pgadmin.org/docs/pgadmin4/latest/index.html)
for accessing and configuring the database using a browser. pgAdmin will be
available at http://localhost:5050 after running it as described previously.

Login credentials for pgAdmin:

- Email: `admin@aalto.fi`
- Password: `password`

From left side menu, select `Servers` and `Grades server` to access the Aalto
Grades database. If prompted, use the password `postgres` to connect.

## Tests

[Jest](https://jestjs.io/docs/getting-started) is used as the unit test
framework. Additionally, [supertest](https://www.npmjs.com/package/supertest)
is used for testing API functionality.

You may run the tests by starting the database as described previously and then
running:

```
npm run test
```
