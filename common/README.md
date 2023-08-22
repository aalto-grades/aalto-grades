<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades common

This is a module for shared types between the frontend and backend. It is
included as a workspace in `client/package.json` and `server/package.json`, and
will be symlinked to `client/node_modules` or `server/node_modules` as
`aalto-grades-common` after running `npm ci` in the corresponding directory.

## Building

Building this module is included as a step in the frontend and backend build
commands.

To build this module on its own, simply run:
```
$ npm run build
```
