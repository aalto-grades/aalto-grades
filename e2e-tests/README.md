<!--
SPDX-FileCopyrightText: 2024 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Running tests

Start the website in docker by running docker compose in the project root:

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
