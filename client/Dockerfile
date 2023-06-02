# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM node:16-alpine

WORKDIR /app

ARG CLIENT_SKIP_NPM_CI

COPY . .

RUN chown -R node:node ./

RUN if [ -z "$CLIENT_SKIP_NPM_CI" ] || [ $CLIENT_SKIP_NPM_CI != 1 ]; then npm ci; fi

RUN npm run build

USER node

CMD ["npm", "start"]

EXPOSE 3005
