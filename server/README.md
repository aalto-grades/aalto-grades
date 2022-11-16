<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto-Grades backend

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
$ npm install
```
Compile and start the program:
```
$ npm run build
$ npm run start
```
After running the last command, visit `http://localhost:3000/world` on a web
browser. You should see the output "Hello /world".
