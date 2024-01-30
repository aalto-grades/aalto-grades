# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM ghcr.io/aalto-grades/aalto-grades-backend-test:test

WORKDIR /app
COPY --chown=node:node reverse-proxy /keys

USER node
EXPOSE 3000
CMD ["/bin/sh", "-c", "\
    npm run migration:up && \
    npm run start"]
