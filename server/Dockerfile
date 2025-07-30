# SPDX-FileCopyrightText: 2024 The Ossi Developers
#
# SPDX-License-Identifier: MIT

# Build stage
FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY common/package.json ./common/
COPY server/package.json ./server/
RUN npm ci

# Copy only necessary files
WORKDIR /app/common
COPY common/types types
COPY common/util util

WORKDIR /app/server
COPY server/tsconfig.json ./
COPY server/src ./src

# Build
RUN npm run build

# Run stage
FROM node:24-alpine AS run

WORKDIR /app/server/
RUN mkdir logs && chown node:node logs

COPY package.json package-lock.json /app/

COPY server/package.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server/.sequelizerc ./
COPY server/mock-data ./mock-data
COPY server/docs ./docs
COPY --from=build /app/server/build ./build

USER node
EXPOSE 3000
CMD ["/bin/sh", "-c", "\
    npm run migration:up && \
    npm run seed:up && \
    npm run start"]
