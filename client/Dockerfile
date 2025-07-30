# SPDX-FileCopyrightText: 2022 The Ossi Developers
#
# SPDX-License-Identifier: MIT

# Build stage
FROM node:24-alpine AS build

WORKDIR /app
RUN mkdir common client

COPY package.json package-lock.json ./
COPY common/package.json ./common
COPY client/package.json ./client

RUN npm ci

# ### Fixes added for a weird missing package during build instead of npm ci
# # Install git for GitHub dependencies
# RUN apk add --no-cache git
# # Clear npm cache and remove any platform-specific issues
# RUN rm -rf node_modules package-lock.json
# RUN npm install
# # Ensure all optional dependencies are installed for the current platform
# RUN npm rebuild
# ###

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
FROM nginx:1.28-alpine AS run

COPY --from=build /app/client/build /user/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
