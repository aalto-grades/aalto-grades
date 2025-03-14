<!--
SPDX-FileCopyrightText: 2022 The Ossi Developers

SPDX-License-Identifier: MIT
-->

# Ossi client

## Running for development

Install the packages:

```
npm i
```

Also install the packages in the common folder

```
npm i --prefix ../common
```

Start the client:

```
npm start
```

When the client is starting, a browser window should automatically open to the
URL of the client, if not, you can manually open http://localhost:3005 to
access it.

In order to run the client in any meaningful capacity, you must also start the
server. Please see `server/README.md` for instructions on running the server.

## Tests

There are no tests specifically for the client because all of the test cases
can be covered just as well or better with end-to-end tests. See the
`e2e-tests` directory at the root of the repository for more information.

## Translation utils

There are several scripts to aid in managing translations.

- `npm run trans-parse`: Parses the source code for missing translation keys in
  the locale translation files.
- `npm run trans-copy` and `npm run trans-rename`: The first command simply
  copies the English translation file to `client/translation.json`. The
  structure of this file can then be edited, and afterwards the second command
  can be used to apply the changes to the source code as well as the locale
  translation files. Note that you may not remove, add, or change any of the
  values themselves, this script is only useful for renaming keys.
- `npm run trans-merge`: Checks whether multiple translation keys are pointing
  to the same value in English and if so, asks the user to merge the keys to the
  same value. <!-- This may not be desirable in all cases -->
