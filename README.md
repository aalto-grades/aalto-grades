<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades

Aalto Grades is a grade/point management system for storing the grades of
students to assigned tasks (attainments) during courses and using these grades
to calculate their final course grades which can be exported to an external
system for tracking course completion.

Attainments can be arbitrarily defined by a teacher and may typically include,
for example, an exam, a set of exercises, or a course project. Attainments are
stored in a tree structure, so each attainment may contain any number of
children. For example, an attainment called "A+ exercises" may include the
subattainment "Round 1," which in turn may have the subattainments
"Round 1 exercise 1" and "Round 1 exercise 2."

## Getting started

The project uses [Node.js](https://nodejs.org/en/) as its runtime environment
and npm to manage dependencies.

Most major GNU/Linux and BSD distributions contain packages for Node.js and
npm. You can find a list of some common distributions and their Node.js and npm
packages at: https://nodejs.org/en/download/package-manager/

Windows and macOS users can install Node.js and npm from:
https://nodejs.org/en/download/

For more documentation, please see the
[wiki](https://github.com/aalto-grades/base-repository/wiki).

### Docker

You may also wish to run the system using [Docker](https://www.docker.com), in
which case you must install Docker itself and Docker Compose.

Many GNU/Linux and BSD distributions contain packages for `docker` and
`docker-compose`. You may need to configure Docker to use the remote registry
`https://registry.hub.docker.com` before being able to run Aalto Grades, if it
is not already preconfigured. Note that the registry and its containers can
include *proprietary software*, so use it at your own discretion.

Windows and macOS users may install Docker and Docker Compose from:
- https://www.docker.com/
- https://docs.docker.com/compose/install/

When using Docker to run the system, in order to speed up repeated startups of
the system, you may define the environment variables `CLIENT_SKIP_NPM_CI` and
`SERVER_SKIP_NPM_CI` to skip running `npm ci` each time in the build process
of the frontend and backend respectively. You will need to manually run
`npm ci` once in the corresponding directory, and then after setting the
environment variables, the `node_modules` you already fetched will be copied to
the containers. Setting the value of the variables to `1` is treated as
enabling the functionality.

## Building and running

You can run the development build of the whole Aalto Grades system, including
the frontend, backend, and database, by running `docker-compose up` at the root
of the project.

In order to run the program, you must define the `POSTGRES_PASSWORD`
environment variable with a password of your choice.

```
$ export POSTGRES_PASSWORD=XXXX
$ docker-compose up
```

When developing or demonstrating the system, you may use one of the premade
user accounts for this purpose. There are two such accounts, an admin account
and a teacher account.

Admin user credentials:
```
username: admin@aalto.fi
password: password
```

Teacher user credentials:
```
username: teacher@aalto.fi
password: password
```

For instructions on running tests or individual parts of the system, see the
REAMDE file of the corresponding directory, such as `client/README.md` and
`server/README.md`.

## License

Aalto Grades is free software released under the Expat (or "MIT") License.
