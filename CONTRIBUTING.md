<!--
SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

# Aalto Grades contributing guidelines

## Getting started

The project uses [Node.js](https://nodejs.org/en/) as its runtime environment
and npm to manage dependencies.

Most major GNU/Linux and BSD distributions contain packages for Node.js and
npm. You can find a list of some common distributions and their Node.js and npm
packages at: https://nodejs.org/en/download/package-manager/

Windows and macOS users can install Node.js from:
https://nodejs.org/en/download/

For more instructions, see `client/README.md` and `server/README.md`.

## Issues

### Bug reports

The title of the bug report should be short and descriptive, providing a brief
overview of what went wrong and how.

In more detail, the bug report should explain at least the following:
- Steps to reproduce
- Expected outcome
- Actual outcome

An estimate of the severity of the bug in terms of how much it impacts
functionality and/or security should be included.
- **Low**: Minor problem, does not significantly impact functionality.
- **Medium**: Noticeable impact on functionality without completely breaking
  the application.
- **High**: Breakage of major functionality or a severe security issue.

### Design issues

<!--TODO-->

### Feature requests

<!--TODO-->

## Code style

Code style is primarily enforced by [ESLint](https://eslint.org/). The client
and server both have their own ESLint configuration, and they may slightly
differ, but major common points are:
- Use `camelCase` for function and variable definitions
- Use `PascalCase` for type definitions
- Use 2 spaces for indentation
- Use single quotes for strings
- Always include semicolons

For both the client and server, to run the linter, use the following command in
the respective subdirectory:
```
$ npm run lint
```
If the linter isn't satisfied, you may need to manually edit the code to fix
the issues, but you can get the linter to automatically fix some of them with:
```
$ npm run lint:fix
```

## Licensing

The repository should be compliant with the [REUSE](https://reuse.software/)
specification, which maintains that every file must be marked with a
machine-readable copyright and license notice. You may wish to install the
[REUSE tool](https://github.com/fsfe/reuse-tool) to automatically add file
headers and check for compliance.

By default, if a file was created by you, it should be marked with the
copyright holder "The Aalto Grades Developers," carrying the
[Expat (MIT) License](https://directory.fsf.org/wiki/License:Expat). This can
be done automatically with the `reuse-addheaders.sh` script at the root of the
repository.

If you copy a file from elsewhere, please ensure that the file is licensed
under an appropriate [free software](https://www.gnu.org/licenses/license-list.html#SoftwareLicenses)
or [free documentation](https://www.gnu.org/licenses/license-list.html#DocumentationLicenses)
license, and indicate the proper copyright holder and license of the file
manually. Using the REUSE tool, this can be done with:
```
$ reuse addheader --year=1970 --copyright="John Doe" --license="SPDX-License-Identifier" file.js
```

For uncommentable files, such as JSON files, the REUSE tool may generate
companion files with a `.license` extension. We do not want these files to be
pushed, so for these uncommentable files, indicate the license and copyright
holder in the `.reuse/dep5` file, following the 
[debian/copyright file format](https://www.debian.org/doc/packaging-manuals/copyright-format/1.0).

You can check that your changes are REUSE compliant using:
```
$ reuse lint
```
