<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# base-repository
Repo for Aalto-Grades Program

# Development build

You can run the development build of the software by running "docker-compose" up in the root folder of the project.

This command has one requirement which is defining the environmental variable "POSTGRES_PASSWORD" before execution.

Demo flow:
```
    export POSTGRES_PASSWORD=XXXX
    docker-compose up
```
