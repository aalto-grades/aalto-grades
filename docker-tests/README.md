<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

This Docker Compose creates an environment where backend tests can be executed against a PostgreSQL instance running in a container.

## Usage

Define a PostgreSQL password in the environment variable POSTGRES_PASSWORD, for example:
```
$ export POSTGRES_PASSWORD="your-wanted-password"
```
Execute Docker Compose:
```
$ docker-compose up --abort-on-container-exit --exit-code-from back-end-test
```

## Known Issue

When running `docker-compose up` for the second time, Sequelize will attempt to seed the data into the database again and fails because of duplicate entries existing in the database.

If you don't like the errors and don't care about the data in the database, you can always recreate the database container by running:
```
$ docker-compose up --abort-on-container-exit --exit-code-from back-end-test --build --force-recreate
```
