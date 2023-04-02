# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

*** Settings ***

Resource    ./keywords.robot

* Test Cases *

Create a new course
    Skip
    Login as Admin Account
    Navigate to Create new Course
    Fill Course information and submit
    Verify Course Exists