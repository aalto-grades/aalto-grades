# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

# Build stage
FROM node:18-alpine AS build

WORKDIR /app
RUN mkdir common client

# Install packages first to make following builds faster
WORKDIR /app/common
COPY common/package.json common/package-lock.json ./
RUN npm ci

WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci

# Copy only necessary files
WORKDIR /app/common
COPY common/types types
COPY common/util util

WORKDIR /app/client
COPY client/tsconfig.json client/.env client/index.html client/vite.config.ts client/build.sh ./
COPY client/public ./public
COPY client/src ./src

# Build
RUN npm run build

# Run stage
FROM nginx:1.23.3-alpine AS run

COPY --from=build /app/client/build /user/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
