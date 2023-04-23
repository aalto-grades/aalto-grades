# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

*** Settings ***

Resource          ./keywords.robot
Test Setup       Login as Admin Account
Test Teardown    Sign Out

* Test Cases *

View a course instance
    Open Instances of Course    CS-A1150 – Databases
    Verify Instance Contains Required Data

Add a new course instance to a course using SISU
    Open Instances of Course    CS-A1150 – Databases
    Navigate to course instance creation view
    Select Base from SISU       Teaching
    Complete Attainment Creation

Add a new course instance to a course without SISU
    Skip
    Open Instances of Course    CS-A1150 – Databases
    Navigate to course instance creation view
    Select to start course instance creation from scratch
    Verify the table opens without text being filled
    