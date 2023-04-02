*** Settings ***

Resource    ./keywords.robot

* Test Cases *

Create a new course
    Login as Admin Account
    Navigate to Create new Course
    Fill Course information and submit
    Verify Course Exists