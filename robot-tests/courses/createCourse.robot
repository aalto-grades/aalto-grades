# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

*** Settings ***

Resource          ./keywords.robot
Test Setup       Login as Admin Account
Test Teardown    Sign Out

* Test Cases *

Create a new course
    Navigate to Create new Course
    Fill Course information and submit
    Verify Navigation Back Courses Page
