<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades

Aalto Grades is a grade management system for storing the grades (or points) of
students to course parts such as an exam, exercises, or a project, and
optionally individual assigned tasks which make up these course parts, such as a
particular essay or exercise. The grades of these tasks can then be used to
calculate the grades of the course parts as well as students' final grades of
the course. These final grades can then be exported to an external system for
tracking course completion.

Aalto Grades contains integration with [A+](https://github.com/apluslms/a-plus),
allowing results to be directly imported to Aalto Grades through the A+ API.

## Getting started

The project uses [Node.js](https://nodejs.org/en/) as its runtime environment
and npm to manage dependencies, which you will need to install.

You may also wish to run the system using [Docker](https://www.docker.com), in
which case you must also install Docker itself and Docker Compose.

The README files of this repository primarily contain instructions for running
Aalto Grades and its tests. For more documentation, please see the
[wiki](https://github.com/aalto-grades/aalto-grades/wiki).

## Building and running

You can run the development build of the whole Aalto Grades system, including
the frontend, backend, and database, by running Docker Compose at the root of
the project:

```
docker compose up
```

Afterwards, the website will be accessible at http://localhost:8080 and the API
documentation at http://localhost:8080/api-docs.

When developing or demonstrating the system, you may use one of the pre-made
user accounts for this purpose.

| User              | Email                | Password   |
| ----------------- | -------------------- | ---------- |
| Admin account     | `admin@aalto.fi`     | `password` |
| Teacher account   | `teacher@aalto.fi`   | `password` |
| Assistant account | `assistant@aalto.fi` | `password` |
| Student account   | `student@aalto.fi`   | `password` |

When asked for an MFA code in the development environment, the server will
accept any input without validation.

For instructions on running tests or individual parts of the system, see the
README file of the corresponding directory, such as `client/README.md` and
`server/README.md`.

## How to contribute

### New feature

1. Create a new feature or fix branch from the `dev` branch.
2. Do your additions and changes.
3. Create tests for new functionality and check that all tests pass.
4. Run linters.
5. Check that the changes follow the
   [code style](https://github.com/aalto-grades/aalto-grades/wiki/Code-style),
   [design guidelines](https://github.com/aalto-grades/aalto-grades/wiki/Design-Guidelines),
   and [licensing guidelines](https://github.com/aalto-grades/aalto-grades/wiki/Licensing-Guidelines).
6. Update documentation and API definition as needed.
7. When developing the client, update (at minimum) the translation keys of all
   languages using `npm run trans-parse` as described in `client/README.md`.
8. Create a pull request to the `dev` branch.
9. Check that all requirements pass.
10. Request someone to review your PR.

## License

Aalto Grades is free software released under the Expat (or "MIT") License.
