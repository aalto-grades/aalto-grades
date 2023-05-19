# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT
*** Settings ***

Resource          ./keywords.robot
Test Setup       Login as Admin Account
Test Teardown    Sign Out

***Keywords***

Verify Functionality of Assignments
    Skip
    Login as Admin Account
    Open Instances of Course    CS-A1150 – Databases
    Edit Exercises Attainments
    Verify Edit Contains Correct Buttons
