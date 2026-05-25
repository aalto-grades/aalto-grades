# SPDX-FileCopyrightText: 2024 The Ossi Developers
#
# SPDX-License-Identifier: MIT

# Build stage
FROM ghcr.io/pnpm/pnpm:latest AS build

# Install packages first to make following builds faster
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY common/package.json ./common/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile --filter ./common... --filter ./server...

# Copy only necessary files
WORKDIR /app/common
COPY common/types types
COPY common/util util

WORKDIR /app/server
COPY server/tsconfig.json ./
COPY server/src ./src

# Build
RUN pnpm run build

# Run stage
FROM node:26-alpine AS run

RUN npm install -g pnpm@latest-11

WORKDIR /app
RUN mkdir logs && chown node:node logs

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY server/package.json /app/server/
RUN pnpm install --frozen-lockfile --prod --filter ./server...

WORKDIR /app/server/
COPY server/.sequelizerc ./
COPY server/mock-data ./mock-data
COPY server/docs ./docs
COPY --from=build /app/server/build ./build

# pnpm creates temporary files under /app during script execution.
# Ensure runtime user can write there.
RUN chown -R node:node /app

USER node
EXPOSE 3000
CMD ["/bin/sh", "-c", "\
    pnpm run migration:up && \
    pnpm run seed:up && \
    pnpm run start"]