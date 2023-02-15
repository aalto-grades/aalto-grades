# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM node:16-alpine

WORKDIR /app

COPY --chown=node:node . .

RUN npm ci

RUN npm run build

USER node

CMD ["npm", "start"]

EXPOSE 3005
