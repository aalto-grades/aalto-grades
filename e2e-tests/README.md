<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Cypress end-to-end testing

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

Currently, the output of the test cases is only printed to stdout, i.e. no report
files are generated.