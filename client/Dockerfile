# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM node:16-alpine

WORKDIR /app

COPY --chown=node:node common common
COPY --chown=node:node client client

WORKDIR /app/client
USER node

ARG CLIENT_SKIP_NPM_CI
RUN if [ -z "$CLIENT_SKIP_NPM_CI" ] || [ $CLIENT_SKIP_NPM_CI != 1 ]; \
    then npm ci; fi

RUN npm run build

CMD ["npm", "start"]

EXPOSE 3005
