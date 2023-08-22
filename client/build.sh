#!/bin/sh

# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

# Build common
npm --prefix ../common run build

# Build client
DISABLE_ESLINT_PLUGIN=true react-scripts build

# Generate the JavaScript License Web Labels form
node set-web-labels.js

# Generate a list of the licenses of all dependencies
npx license-checker-rseidelsohn --excludePrivatePackages \
    --production --plainVertical > build/licenses.txt
