#!/bin/sh

# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

cmd="$@"
url="${LOCALHOST_URL}/login"

echo "Waiting for URL ${url}"

until curl -s -o /dev/null -w "%{http_code}" ${url} | grep "200" 2>&1 > /dev/null; do
    >&2 echo "wait-for-frontend.sh: waiting for URL ${url}"
    sleep 5
done

sleep 10
echo "URL reached"

${cmd}