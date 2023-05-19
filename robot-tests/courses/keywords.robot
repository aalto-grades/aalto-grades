# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

***Settings***

Resource    ../common/keywords.robot
Resource    ./variables.robot
Resource    ../authentication/keywords.robot

***Keywords***

#Course Creation
Navigate to Create new Course
    Click    ${createNewCourseButton}

Fill Course information and submit
    Fill Text   ${courseCodeField}          ${testCourseCode}
    Fill Text   ${courseNameField}          ${testCourseName}      
    Fill Text   ${courseOrganizerField}     ${testCourseOrganizer}      
    Click       ${createCourseSubmitButton}
    
Verify Navigation Back Courses Page
    Verify Admin User registering succeeded

#Course Instance verification
Open Instances of Course
    [Arguments]     ${courseCode}
    Click           //div[contains(h6,'${courseCode}')]/following::div/button

Verify Instance Contains Required Data
    Page Contains Element     ${createNewInstanceButton}
    Page Contains Element     ${addAttainmentButton}
    Page Contains Element     ${seeCourseResultsButton}
    Page Contains Element     ${importGradesButton}

#Course instance Creation

Navigate to course instance creation view
    Click                     ${createNewInstanceButton}

Select Base from SISU
    [Arguments]     ${sisuType}     
    Click        //p[contains(.,"${sisuType}")]

Complete Attainment Creation
    Click                     ${confirmDetailsButton}
    Click                     ${confirmAttainmentsButton}
    Click                     ${createInstanceButton}
    Page Contains Element     ${redirectText}
    Click                     ${returnToCourseViewButton}     

Select to start course instance creation from scratch
    Click                     ${startFromScratchButton}

Verify the table opens without text being filled
    Skip

#Attainments

Edit Exercises Attainments
    Click                    ${editExercisesAttainment}

Verify Edit Contains Correct Buttons
    Page Contains Element    ${editFormulaButton}
    Page Contains Element    ${addSubAttainmentsButton}
    Page Contains Element    ${deleteAttainmentButton}
    Page Contains Element    ${confirmAttainmentChanges}