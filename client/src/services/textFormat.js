// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

// use 'en-GB' to get "20.07.2012, 05:00:00" 
// (instead of 'fi-GB' which produces "20.7.2012 klo 5.00.00")
const formatDateToString = (date) => {
  const string = date.toLocaleString('en-GB').replaceAll('/', '.');
  return string.split(',')[0];
};

// Change date string from format "2012-07-20" to "20.07.2012"
const formatDateString = (dateString) => {
  const attributes = dateString.split('-');
  const year = attributes[0];
  const month = attributes[1];
  const day = attributes[2];
  return [day, month, year].join('.');
};

// Change course type from "LECTURE" to "Lecture", 
// and from "EXAM" to "Exam"
const formatCourseType = (courseType) => {
  switch (courseType) {
  case 'LECTURE':
    return 'Lecture';
  case 'EXAM':
    return 'Exam';
  default:
    return courseType;
  }
};

export default { formatDateToString, formatDateString, formatCourseType };