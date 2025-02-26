#!/bin/sh

# SPDX-FileCopyrightText: 2024 The Ossi Developers
#
# SPDX-License-Identifier: MIT

rm -rf ./blob-reporter
rm -rf ./playwright-report
rm -rf ./blob-report

mkdir -p ./blob-reporter

npx playwright test --project chromium --reporter=list,blob

mv ./blob-report/report-chromium.zip ./blob-reporter/shard-1.zip

npx playwright test --project firefox --reporter=list,blob

mv ./blob-report/report-firefox.zip ./blob-reporter/shard-2.zip

npx playwright merge-reports --reporter=html ./blob-reporter

echo "Test finished, cleaning up..."
rm -rf ./blob-reporter