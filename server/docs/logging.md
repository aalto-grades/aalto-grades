
## Logging

The server handles logging using [Winston](https://github.com/winstonjs/winston) for handling and formatting logs and [Morgan](https://github.com/expressjs/morgan) for logging http requests.


[Winston Configuration](/server/src/configs/winston.ts)

[Morgan Configuration](/server/src/middleware/requestLogger.ts)

### syslog

Logs are logged to cli by winston and Docker forwards the logs to syslog

using tcp. See backend logging part of

[Docker compose](/docker-compose-from-images.yaml)