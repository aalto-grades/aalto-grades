<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Robot Framework end-to-end testing

This end-to-end testing is implemented utilizing the Robot Framework and
notably the browser library of the Robot Framework.

Generic user guide of the Robot Framework (quite long):
https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html

Keyword documentation of the browser library:
https://marketsquare.github.io/robotframework-browser/Browser.html

## Fast track to keywords

Robot Framework tests are written utilizing an abstraction called keywords.
These keywords are then used as building blocks for new keywords:

Python implementation -> Base keyword abstraction -> Higher level keywords in
infinite layers

For example in the authentication test cases we utilize the following keyword:

```
Verify Admin User registering succeeded
```

The implementation of this keyword is located in
`authentication/keywords.robot`.

This keyword is implemented by calling a common keyword located in
`common/keywords.robot` called `Page Contains Element`, which is implemented
in `common/keywords.robot` by utilizing a keyword defined by the browser
library called `Get Element Count`. This keyword's functionality is implemented
either on top of other keywords or a manually programmed Python implementation
by the library.

## Structure of the directory

This directory is structured in the following way:

```
common/
output/
high-level-feature-directories/
```

The common directory contains generic keywords utilized by most tests.

```
keywords.robot
variables.robot
```

The output directory is an automatically generated directory used as a place
to store the output of the Robot Framework after execution.

The high-level feature directories such as authentication and courses contain
the following files:

```
keywords.robot
variables.robot
low-level-features.robot
```

`keywords.robot` in these feature directories define keywords to be imported
and used in the corresponding low-level feature tests. They also import
`common/keywords.robot` and the local `variables.robot`.

## Running the tests

The end-to-end tests are run in GitHub Actions through the Docker Compose
configuration located in this directory. The same Docker Compose configuration
can be used to run the tests locally:

```
$ docker-compose up --abort-on-container-exit --exit-code-from robot
```

The tests can be ran locally by installing the following Python packages:

```
$ pip install robotframework
$ pip install robotframework-browser
```

Note that using a virtual environment for pip is recommended.

After that the tests can be ran by writing

```
robot --outputdir output/ .
```
