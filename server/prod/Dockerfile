# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM ghcr.io/aalto-grades/aalto-grades-backend-test:test

WORKDIR /app

COPY --chown=node:node reverse-proxy /keys

WORKDIR /app/server
USER node


CMD ["/bin/sh", "-c", "\
    npm run migration:up && \
    npm run seed:up && \
    if [ $NODE_ENV == 'test' ]; then npm test; \
    else npm run start; fi"]

EXPOSE 3000