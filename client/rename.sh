#!/bin/sh

# SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

echo -n "Old: "
read old
echo -n "New: "
read new

find src -type f -exec sed -i "s/t('${old}')/t('${new}')/g" {} +
