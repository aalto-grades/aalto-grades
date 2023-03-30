# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

*** Settings ***

Resource    ./keywords.robot

* Test Cases *

View a course instance
    Skip
    Login as Admin Account
    Open Instances of Course    CS-A1150
    Verify Instance Contains Required Data
    Sign Out

View a course instance of an inactive course
    Skip
    Login as Admin Account
    Open Inactive course        CS-A1110
    Verify Instance Contains Required Data and is inactive
    Sign Out

Add a new course instance to a course using SISU
    Skip
    Login as Admin Account
    Open Instances of Course    CS-A1150
    Navigate to course instance creation view
    Select Base from SISU       "BASE"

Add a new course instance to a course without SISU
    Skip
    Login as Admin Account
    Open Instances of Course    CS-A1150
    Navigate to course instance creation view
    Select to start course instance creation from scratch
    