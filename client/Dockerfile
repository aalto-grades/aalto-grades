# SPDX-FileCopyrightText: 2022 The Ossi Developers
#
# SPDX-License-Identifier: MIT

# Build stage
FROM node:24-alpine AS build

RUN corepack enable

# Install packages first to make following builds faster
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY common/package.json ./common/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile --filter ./common... --filter ./client...

# Copy only necessary files
WORKDIR /app/common
COPY common/types types
COPY common/util util

WORKDIR /app/client
COPY client/tsconfig.json client/tsconfig.node.json client/tsconfig.app.json ./
COPY client/libre-js-plugin.ts client/vite-env.d.ts client/vite.config.mts client/index.html ./
COPY client/public ./public
COPY client/src ./src

# Build
RUN pnpm run build

# Run stage
FROM nginx:1.28-alpine AS run

COPY --from=build /app/client/build /user/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
