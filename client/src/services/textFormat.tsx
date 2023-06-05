// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

// use 'en-GB' to get "20.07.2012, 05:00:00" 
// (instead of 'fi-GB' which produces "20.7.2012 klo 5.00.00")
const formatDateToString = (date) => {
  const string = date.toLocaleString('en-GB').replaceAll('/', '.');
  return string.split(',')[0];
};

// Change date string of format "2012-07-20" to Date type
const formatStringToDate = (string) => {
  const date = new Date(string);
  return date;
};

// Format Date type values to strings of the format "2023-01-01"
const formatDateToSlashString = (date) => {
  const string = date.toLocaleString('en-GB');
  return string.split('T')[0];
};

// Change date string from format "2012-07-20" to "20.07.2012"
const formatDateString = (dateString) => {
  const attributes = dateString.split('-');
  const year = attributes[0];
  const month = attributes[1];
  const day = attributes[2];
  return [day, month, year].join('.');
};

// Change course type from "LECTURE" to "Lecture" and from "EXAM" to "Exam".
// Also, change course type gotten from Sisu to a more readable type
const formatCourseType = (courseType) => {
  switch (courseType) {
  case 'teaching-participation-lectures':  // Type from Sisu API
    return 'Teaching';
  case 'exam-exam':  // Type from Sisu API
    return 'Exam';
  case 'teaching-participation-project':  // Type from Sisu API
    return 'Project';
  case 'LECTURE':
    return 'Teaching';
  case 'EXAM':
    return 'Exam';
  default:
    return courseType;
  }
};

// Change course type from "NUMERICAL", "PASSFAIL" and from "SECOND_NATIONAL_LANGUAGE"
// to a more readable types.
// These are for the UI only. These need to be converted back when adding data to the server.
const convertToClientGradingScale = (gradingScale) => {
  switch (gradingScale) {
  case 'NUMERICAL':
    return 'General scale, 0-5';
  case 'PASS_FAIL':
    return 'Pass-Fail';
  case 'SECOND_NATIONAL_LANGUAGE':
    return 'Second national language';
  default:
    return gradingScale;
  }
};

const convertToServerGradingScale = (gradingScale) => {
  switch (gradingScale) {
  case 'General scale, 0-5':
    return 'NUMERICAL';
  case 'Pass-Fail':
    return 'PASS-FAIL';
  case 'Second national language':
    return 'SECOND_NATIONAL_LANGUAGE';
  default:
    return gradingScale;
  }
};

export default { 
  convertToServerGradingScale,
  formatDateToString, 
  formatStringToDate, 
  formatDateToSlashString, 
  formatDateString, 
  formatCourseType, 
  convertToClientGradingScale 
};
