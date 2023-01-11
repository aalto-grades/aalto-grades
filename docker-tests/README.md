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

Known Issue:

When running docker-compose up for the second time, sequalize will attempt to seed the data again into the database, and will be refused because of duplicate data entries existing already in the database. 

If you don't like the errors, and don't care about the data in the database, you can always recreate the database container by running:

```
docker-compose up --build --force-recreate
```