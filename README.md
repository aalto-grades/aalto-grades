<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades

Aalto Grades is a grade/point management system for storing the grades of
students to assigned tasks (course parts) during courses and using these grades
to calculate their final course grades which can be exported to an external
system for tracking course completion.

Course parts can be arbitrarily defined by a teacher and may typically include,
for example, an exam, a set of exercises, or a course project.

## Getting started

The project uses [Node.js](https://nodejs.org/en/) as its runtime environment
and npm to manage dependencies.

Most major GNU/Linux and BSD distributions contain packages for Node.js and
npm. You can find a list of some common distributions and their Node.js and npm
packages at: https://nodejs.org/en/download/package-manager/

Windows and macOS users can install Node.js and npm from:
https://nodejs.org/en/download/

The README files of this repository primarily contain instructions for running
Aalto Grades and its tests. For more documentation, please see the
[wiki](https://github.com/aalto-grades/base-repository/wiki).

### Docker

You may also wish to run the system using [Docker](https://www.docker.com), in
which case you must install Docker itself and Docker Compose.

Many GNU/Linux and BSD distributions contain packages for `docker` and
`docker-compose`. You may need to configure Docker to use the remote registry
`https://registry.hub.docker.com` before being able to run Aalto Grades, if it
is not already preconfigured. Note that the registry and its containers can
include _proprietary software_, so use it at your own discretion.

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

When developing or demonstrating the system, you may use one of the pre-made
user accounts for this purpose. There are two such accounts, an admin account
and a teacher account.

Admin user credentials:

- Email: `admin@aalto.fi`
- Password: `password`

Teacher user credentials:

- Email: `teacher@aalto.fi`
- Password: `password`

For instructions on running tests or individual parts of the system, see the
README file of the corresponding directory, such as `client/README.md` and
`server/README.md`.

## How to contribute

### New feature

1. Create a local development branch from the 'dev' branch.
2. Do your additions and changes.
3. Create tests for new functionality and check that all tests pass.
4. Run linters.
5. Check that the changes are in line with [Code style](https://github.com/aalto-grades/base-repository/wiki/Code-style) and [Design guidelines](https://github.com/aalto-grades/base-repository/wiki/Design-Guidelines) and [Licensing guidelines](https://github.com/aalto-grades/base-repository/wiki/Licensing-Guidelines).
6. Update documentation and API definition as needed.
7. Merge your changes to the 'dev' branch and push
8. Create pull request from 'dev' to main
9. Check that all tests pass and the staging system is working
10. Assign someone to review your PR

## License

Aalto Grades is free software released under the Expat (or "MIT") License.
