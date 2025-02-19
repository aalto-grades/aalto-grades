<!--
SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Running tests

> The first time (or to update the tested browser agents):
    ```
    npx playwright install
    ```

Start the website in Docker by running Docker Compose at the root of the
project:

```
docker compose up --build
```

>If you changed the port of postgres remember to add POSTGRES_PORT to this folder .env.

Then launch Playwright in this directory in CLI mode:

```
./start-test.sh
```

Or in UI mode (remeber to select all projects when testing):

```
npx playwright test --ui
```
