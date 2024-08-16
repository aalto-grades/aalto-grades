<!--
SPDX-FileCopyrightText: 2024 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Running tests

Start the website in docker by running docker compose at the root of the project:

```
docker compose up --build
```

Then launch playwright in cli mode:

```
npx playwright test
```

or in ui mode:

```
npx playwright test --ui
```
