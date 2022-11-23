<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto-Grades backend

## Table of Contents

- [Installing Node.js](#installing-nodejs)
- [Running the program](#running-the-program)
- [Migrations and Seeds](#migrations-and-seeds)

## Installing Node.js

For Windows and macOS users, Node.js can be installed from:
https://nodejs.org/en/download/

For GNU/Linux users, your distribution likely contains packages for Node.js and
npm. For example:

Arch: `# pacman -S nodejs npm`  
Debian: `# apt install nodejs npm`

## Running the program

Install the necessary Node.js modules:
```
$ npm ci
```
Compile and start the program:
```
$ npm run build
$ npm run start
```
After running the last command, visit `http://localhost:3000/world` on a web
browser. You should see the output "Hello /world".


## Migrations and Seeds

Uses The Sequelize [Command Line Interface](https://github.com/sequelize/cli).
More information in Sequelize [documentation](https://sequelize.org/docs/v6/other-topics/migrations/).
The database which CLI will connect is defined in `/src/configs/database.ts`, more information
on options [here](https://github.com/sequelize/cli/blob/main/docs/README.md).
Migration, seeder, config and model paths defined in *.sequelizerc*.

Run database migrations:
```
$ npm run migration:up
```

Run one migration down:
```
$ npm run migration:down
```

You can populate tables with dummy data with seed files from seeders folder.
Seed files are some change in data that can be used to populate database 
tables with sample or test data.

Run all seeders:
```
$ npm run seed:up
```

Clear one seeders:
```
$ npm run seed:down
```
