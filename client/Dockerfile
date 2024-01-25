# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM node:16-alpine

WORKDIR /app
RUN mkdir common client && chown node:node client

# Install packages first to make following builds faster
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci

# Copy common first
WORKDIR /app
COPY common/types common/types

# Copy only necessary client files
WORKDIR /app/client
COPY client/.env client/tsconfig.json client/index.html client/vite.config.ts client/build.sh ./
COPY client/public ./public
COPY client/src ./src

# Build and run
USER node
RUN npm run build

EXPOSE 3005
CMD [ "npm", "run", "dev-docker-preview" ]
