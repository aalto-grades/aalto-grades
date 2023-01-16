# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM node:19-alpine

WORKDIR /app

ARG SERVER_SKIP_CI

COPY . .

RUN chown -R node:node ./*

RUN if [ -z "$SERVER_SKIP_CI" ] || [ $SERVER_SKIP_CI != 1 ]; then npm ci; fi

RUN npm run build

USER node

CMD ["/bin/sh", "-c", "npm run migration:up && npm run seed:up && if [ $SERVER_RUN_TESTS == 1 ]; then npm test; else npm run start; fi"]

EXPOSE 3000
