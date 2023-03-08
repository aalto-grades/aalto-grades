*** Settings ***

Resource    ./keywords.robot

* Test Cases *

Test SignUp on localhost
    Open Aalto Grades on Localhost
    Navigate to SignUp
    Fill Admin Register Information
    Verify Admin User registering succeeded
    Sign Out

Test Login on localhost
    Open Aalto Grades on Localhost
    Submit Login Information
    Verify Admin User registering succeeded
    Sign Out