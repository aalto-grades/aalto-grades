
***Settings***

Resource    ../common/keywords.robot
Resource    ./variables.robot

***Keywords***

Fill Admin Register Information
    Fill Text   ${signUpNameField}          ${adminUsername}      
    Fill Text   ${signUpEmailField}         ${adminEmail}
    Fill Text   ${signUpStudentIdField}     ${adminStudentID}
    Fill Text   ${signUpPassword}           ${adminPassword}
    Click       ${signUpAdminSelector}
    Click       ${signUpSubmit}

Verify Admin User registering succeeded
    Page Contains Element   ${createNewCourseButton}

Navigate to SignUp
    Click       ${signUpLink}


Submit Login Information
    Fill Text   ${logInEmailField}          ${adminEmail}
    Fill Text   ${logInPasswordField}       ${adminPassword}
    Click       ${logInSubmit}     

Login as Admin Account
    Open Aalto Grades on Localhost
    Submit Login Information
    Verify Admin User registering succeeded
