#!/bin/sh

# SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

cmd="$@"
url="${LOCALHOST_URL}/login"

echo "Trying to connect to ${url}"

until curl -s -o /dev/null -w "%{http_code}" ${url} | grep "200" 2>&1 >/dev/null; do
    echo >&2 "Waiting for ${url}"
    sleep 5
done

echo "URL reached, sleeping for extra 10 seconds to make sure everything is loaded"
sleep 10

echo "Starting tests"
# npx playwright test
./start-test.sh