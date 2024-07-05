<!--
SPDX-FileCopyrightText: 2024 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Logging

The server handles logging using [Winston](https://github.com/winstonjs/winston) for handling and formatting logs and [Morgan](https://github.com/expressjs/morgan) for logging http requests. There are two separate winston loggers, one for http logs and another for db logs. Currently both of them output to the cli.

- [Winston Configuration](/server/src/configs/winston.ts)
- [Morgan Configuration](/server/src/middleware/requestLogger.ts)

### Syslog

Logs are logged to cli by winston and Docker forwards the logs to syslog
using tcp. Docker sends the messages to syslog port 601. So the server syslog configuration needs to have port 601 listening.

For actual docker configuration
See backend part of [Docker compose](/docker-compose-from-images.yaml)

### Application logs

While running, the application will log:

- Server errors that are unhandled
- Server exceptions that are handled, defined in middleware/controllers
- Some database logs including all database queries
- All calls to A+
- All http requests, in the format:

  ```
  :remote-addr :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":user" ":params" ":body"
  ```
