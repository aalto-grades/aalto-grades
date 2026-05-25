# SPDX-FileCopyrightText: 2024 The Ossi Developers
#
# SPDX-License-Identifier: MIT

# Build stage
FROM node:26-alpine AS build

RUN npm install -g corepack
RUN corepack enable

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

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm install -g corepack
RUN corepack enable

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

USER node
EXPOSE 3000
CMD ["/bin/sh", "-c", "\
    pnpm run migration:up && \
    pnpm run seed:up && \
    pnpm run start"]
