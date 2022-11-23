<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# base-repository
Repo for Aalto-Grades Program

## Development environment

As one of the developers: in order to access the development environment, you
may do the following.

1. Set up configuration for your Aalto access (only required when logging in
for the first time):

```ssh
# ~/.ssh/config
Host kosh
  User hannula7 # REPLACE
Host grades
  User hannula7 # REPLACE
```

2. Log in using the provided configuration file (which uses your own SSH
config as a base):

```sh
$ ssh -F ssh.config grades
```

3. Ensure that the Docker model is running:

```
hannula7@aalto-grades$ cd /srv/aalto-grades
hannula7@aalto-grades$ sudo docker-compose top
# if not running:
hannula7@aalto-grades$ sudo docker-compose up
```

4. Now, the dev environment services can be accessed from your local computer:
  - Backend is at `localhost:3000`
  -	Frontend is at `localhost:3005`
  -	Adminer is at `localhost:8080`
