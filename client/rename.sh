#!/bin/sh

# SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

# Used for renaming translation keys, could be improved to also change the
# translation files. Breaks when the translation function uses interpolation or
# is split across multiple lines.

echo -n "Old: "
read old
echo -n "New: "
read new

find src -type f -exec sed -i "s/t('${old}')/t('${new}')/g" {} +
