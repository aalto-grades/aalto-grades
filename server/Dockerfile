# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM node:16-alpine

WORKDIR /app

COPY . .

RUN chown -R node:node ./*

RUN npm install

RUN npm run build

USER node

CMD ["npm", "run", "start"]

EXPOSE 3000