# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM cypress/browsers:node-20.5.0-chrome-114.0.5735.133-1-ff-114.0.2-edge-114.0.1823.51-1

RUN apt-get update && \
    apt-get install -y curl

RUN mkdir -p /app/cypress
WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY cypress.config.ts .
COPY tsconfig.json .
COPY wait-for-frontend.sh .

RUN npm ci

CMD ["./wait-for-frontend.sh", "npx", "cypress", "run"]