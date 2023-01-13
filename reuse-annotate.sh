#!/bin/bash

# SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

reuse annotate --copyright="The Aalto Grades Developers" --license="MIT" \
      --skip-unrecognised --skip-existing -r . 1> /dev/null

rm `find . -name '*.license'`

reuse lint

if [ $? = 1 ];
then
    echo "
If files with no copyright and license information were found, please include
them in the Files list in .reuse/dep5 and try running reuse lint again to check
for compliance."
fi
