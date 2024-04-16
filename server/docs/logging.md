<!--
SPDX-FileCopyrightText: 2024 The Aalto Grades Developers

SPDX-License-Identifier: MIT
-->

## Logging

The server handles logging using [Winston](https://github.com/winstonjs/winston) for handling and formatting logs and [Morgan](https://github.com/expressjs/morgan) for logging http requests.

[Winston Configuration](/server/src/configs/winston.ts)

[Morgan Configuration](/server/src/middleware/requestLogger.ts)

### Syslog

Logs are logged to cli by winston and Docker forwards the logs to syslog
using tcp. Docker sends the messages to syslog port 601. So the server syslog configuration needs to have port 601 listening.
Our solution uses [rsyslog](https://www.rsyslog.com/doc/index.html)

For actual docker configuration
See backend part of [Docker compose](/docker-compose-from-images.yaml)

### Application logs

While running, the application will log:

- Server Errors that are unhandled
- Server Exceptions that are handled, defined in middleware/controllers
- All http requests, in the format: ':remote-addr :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
- Database queries
