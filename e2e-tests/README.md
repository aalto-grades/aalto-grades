<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Cypress end-to-end tests

This end-to-end testing is implemented utilizing the Cypress framework.

## Structure of the directory

Configuration files for Cypress (and Docker) are located in the root of the
`e2e-tests` directory.

`cypress` directory contains the files related to the test cases, as well as the
artifacts resulting from the test runs, such as screenshots. The directory is
structured as follows:

* `e2e` - contains the spec files with test cases
* `fixtures` - data structures ("fixtures") used by the tests
* `support` - test-related global configurations, such as custom commands
* `downloads` - files downloaded by test cases
* `screenshots` - screenshots from test runs
* `videos` - recorded videos from test runs, if the recording is enabled in config
* `results` - report files from test runs (not implemented atm.)

## Running the tests

The end-to-end tests can be executed locally by using the Docker Compose
configuration located in the root of the `e2e-tests` directory.

```
$ docker-compose up --build --abort-on-container-exit --exit-code-from cypress
```

`cypress` directory is bind-mounted to the Cypress container, which means that
rebuilding the tests is not required, if only the contents of that directory are
modified. In other words, you can omit the `--build` flag in subsequent runs once
the images have been built for the first time, unless you have modified the
configuration outside the directory.

Currently, the output of the test cases is only printed to stdout, i.e., no report
files are generated.

## Running the tests locally without containerization

The tests can be executed outside of the containerized environment as well, which
allows easier debugging if issues are encountered. First, start the run the development
build of the Aalto Grades application, as instructed in the root directory README.

Make sure that you have installed the npm dependencies for `e2e-tests`. After the
application is running, the E2E test cases can be executed locally by running the
following command in the `e2e-tests` directory:

```
LOCALHOST_URL=http://localhost:3005 npx cypress run
```

If you want to use Cypress interactively via GUI, use `cypress open` instead of
`cypress run`. Use the GUI to trigger E2E tests.

## Configuration

The main configuration file for Cypress is named `cypress.config.ts` and is located
in the root of the `e2e-tests` directory. Currently the configuration contains the
URL for the frontend, which is directly read from the environment variable
`LOCALHOST_URL`. Video recording is currently disabled in the configuration. See the
Cypress documentation for the more details.

Custom commands can be added in `cypress/support/commands.ts`.