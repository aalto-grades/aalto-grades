# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

***Variables***

# Create Course
${createNewCourseButton}        button[id=ag_new_course_btn]
${courseCodeField}              input[id=courseCode] 
${testCourseCode}               CS-C2130 
${courseNameField}              input[id=courseName]               
${testCourseName}               Software Project 1
${courseOrganizerField}         input[id=organizer]
${testCourseOrganizer}          Jari-Pekka Vanhanen
${createCourseSubmitButton}     button[id=ag_create_course_btn]


# Course Instance

${createNewInstanceButton}        button[id=ag_new_instance_btn]
${addAttainmentButton}          //button[text()="Add attainment"]
${seeCourseResultsButton}       button[id=ag_course_results_btn]
${importGradesButton}           button[id=menu-button]
${importFromFileSelect}         //li[contains(.,"Import from file")]
${importFromA+Select}           //li[contains(.,"Import from A+")]


#Instance Creation

${startFromScratchButton}       //button[text()="Start from Scratch"]
${teachingSelection}            //p[contains(.,"Teaching")]
${confirmDetailsButton}         button[id=ag_confirm_instance_details_btn]
${confirmAttainmentsButton}     button[id=ag_confirm_instance_attainments_btn]
${createInstanceButton}         button[id=ag_create_instance_btn]
${redirectText}                 //div[contains(text(),"Instance created successfully. Redirecting to course page in 30 seconds.")]
${returnToCourseViewButton}     //button[text()="Return to course view"]

#Attainments

${editExercisesAttainment}     //button[text()="Edit"][1]
${editFormulaButton}           //button[text()="Edit formula"]
${addSubAttainmentsButton}     //button[text()="Add Sub-Attainments"]
${deleteAttainmentButton}      //button[text()="Delete Attainment"]
${confirmAttainmentChanges}    //button[text()="Confirm"]