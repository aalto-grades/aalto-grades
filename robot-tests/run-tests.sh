#!/bin/sh

# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

docker run --rm -v $(pwd):/test marketsquare/robotframework-browser:latest bash -c "robot --outputdir /test/output /test"
