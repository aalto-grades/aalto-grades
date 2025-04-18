# SPDX-FileCopyrightText: 2022 The Ossi Developers
#
# SPDX-License-Identifier: MIT

# Build stage
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json ./
RUN mkdir common client

# Install packages first to make following builds faster
WORKDIR /app/common
COPY common/package.json common/package-lock.json ./
RUN npm ci

WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
COPY client/patches patches
RUN npm ci

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
RUN npm run build

# Run stage
FROM nginx:1.27-alpine AS run

COPY --from=build /app/client/build /user/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
