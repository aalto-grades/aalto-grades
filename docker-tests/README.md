<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

This docker-compose creates an environment where backend tests can be executed against a postgresql instance running in a container.

How to use:
- Define postgresql password environment variable POSTGRES_DATABASE, Example:
```
export POSTGRES_DATABASE="your-wanted-password"
```
- execute docker-compose
```
docker-compose up
```