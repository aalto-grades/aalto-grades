<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Running tests

Start the website in Docker by running Docker Compose at the root of the
project:

```
docker compose up --build
```

Then launch Playwright in this directory in CLI mode:

```
npx playwright test
```

Or in UI mode:

```
npx playwright test --ui
```
