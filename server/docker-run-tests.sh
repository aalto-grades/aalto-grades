# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

#!/bin/sh

cat build/configs/database.js

npm run migration:up

npm run seed:up

npm test
