<!--
SPDX-FileCopyrightText: 2024 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Running tests

In another terminal in the project root run:

```
export POSTGRES_PASSWORD="postgres"
docker compose up --build
```

Then run

```
npx playwright test
```

or

```
npx playwright test --ui
```
