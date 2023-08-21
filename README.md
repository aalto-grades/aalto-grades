<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades

Aalto Grades is a grade/point management system for storing the grades of
students to assigned tasks (attainments) during courses and using these grades
to calculate their final course grades which can be exported to an external
system.

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

### Docker

You may also wish to run the system using [Docker](https://www.docker.com)/,
in which case you must install Docker itself and Docker Compose.

Many GNU/Linux and BSD distributions contain packages for `docker` and
`docker-compose`. You may need to configure Docker to use the remote registry
`https://registry.hub.docker.com` before being able to run Aalto Grades, if it
is not already preconfigured. Note that the registry and its containers can
include *proprietary software*, so use it at your own discretion.

Windows and macOS users may install Docker and Docker Compose from:
- https://www.docker.com/
- https://docs.docker.com/compose/install/

## Development build

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

For instructions on running tests or individual parts of the system, see
`client/README.md`, `server/README.md`, and `e2e-tests/REAMDE.md`.

## Demo virtual machine

As one of the developers, in order to access the virtual machine for
https://aalto-grades.cs.aalto.fi, you may do the following:

1. Set up configuration for your Aalto access (only required when logging in
   for the first time):

```ssh
# ~/.ssh/config
Host kosh
  User myaaltousername # REPLACE
Host grades
  User myaaltousername # REPLACE
```

2. Log in using the provided configuration file (which uses your own SSH
   config as a base):

```sh
$ ssh -F ssh.config grades
```
