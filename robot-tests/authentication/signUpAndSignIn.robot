# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

*** Settings ***

Resource    ./keywords.robot

* Test Cases *

Test SignUp on localhost
    Skip
    Open Aalto Grades on Localhost
    Navigate to SignUp
    Fill Admin Register Information
    Verify Admin User registering succeeded
    Sign Out

Test Login on localhost
    Skip
    Open Aalto Grades on Localhost
    Submit Login Information
    Verify Admin User registering succeeded
    Sign Out