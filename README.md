<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades

Repository for the Aalto Grades program.

## Getting started

The project uses [Node.js](https://nodejs.org/en/) as its runtime environment
and npm to manage dependencies.

Most major GNU/Linux and BSD distributions contain packages for Node.js and
npm. You can find a list of some common distributions and their Node.js and npm
packages at: https://nodejs.org/en/download/package-manager/

Windows and macOS users can install Node.js from:
https://nodejs.org/en/download/

For more instructions, see `client/README.md` and `server/README.md`.

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

## Development environment

As one of the developers: in order to access the development environment, you
may do the following.

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

3. Ensure that the Docker model is running:

```
@aalto-grades$ cd /srv/aalto-grades
@aalto-grades$ sudo docker-compose top
# if not running:
@aalto-grades$ sudo docker-compose up
```

4. Now, the dev environment services can be accessed from your local computer:
  - Backend is at `localhost:3000`
  -	Frontend is at `localhost:3005`
  -	Adminer is at `localhost:8080`
