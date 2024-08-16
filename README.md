<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

<!-- TODO: Update readme to use `docker compose` instead of `docker-compose` -->

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

## Building and running

You can run the development build of the whole Aalto Grades system, including
the frontend, backend, and database, by running docker compose at the root of the project:

```
docker-compose up
```

After that the website is accessible at localhost:8080 and the api docs at localhost:8080/api-docs

When developing or demonstrating the system, you may use one of the pre-made
user accounts for this purpose.

| User              | Email                | Password   |
| ----------------- | -------------------- | ---------- |
| Admin account     | `admin@aalto.fi`     | `password` |
| Teacher account   | `teacher@aalto.fi`   | `password` |
| Assistant account | `assistant@aalto.fi` | `password` |
| Student account   | `student@aalto.fi`   | `password` |

For instructions on running tests or individual parts of the system, see the
README file of the corresponding directory, such as `client/README.md` and
`server/README.md`.

## How to contribute

### New feature

<!-- TODO: Update? -->

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
