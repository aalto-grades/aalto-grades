// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

import textFormatServices from './textFormat';

// The parameter 'indices' used in the following functions is an array of integres 
// that displays the indices of an assignment on different levels.
// EXAMPLE: The indices of the 'assignment 0.1' below would be [0, 1].
/* Assignments = [
    { 
      name: 'assignment 0', 
      date: '',
      subAssignments: [
        { 
          name: 'assignment 0.0', 
          date: '',
          subAssignments: []
        },
        {
          name: 'assignment 0.1', 
          date: '',
          subAssignments: []
        }
      ]
    }
  ]
*/

// Get sub-assignments from the assignments array (of nested arrays) according to the indices
const getSubAssignments = (indices, assignments) => {
  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  let subAssignments = [];
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    subAssignments = updatedAssignments[index].subAssignments;
    updatedAssignments = subAssignments;
  }
  return subAssignments;
};

// Set the proprety of the object that is in the location specified by the indices in the assignments array,
// the property is set to have the value given as a parameter
const setProperty = (indices, assignments, property, value) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, updatedAssignments);
  array[lastIndex][property] = value;
  return updatedAssignments;
};

// Get the property of an assignment that is at the location specified by indices
const getProperty = (indices, assignments, property) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, updatedAssignments);
  return array[lastIndex][property];
};

// Add sub-assignments to the assignments array (of nested arrays) according to the indices
const addSubAssignments = (indices, assignments, numOfAssignments) => {
  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const defaultExpiryDate = getProperty(indices, updatedAssignments, 'expiryDate');
  const newSubAssignments = new Array(Number(numOfAssignments)).fill({
    category: '',
    name: '',
    date: '',
    expiryDate: defaultExpiryDate,
    subAssignments: [],
  });
  const currentSubAssignments = getSubAssignments(indices, updatedAssignments);
  const subAssignments = currentSubAssignments.concat(newSubAssignments);
  updatedAssignments = setProperty(indices, updatedAssignments, 'subAssignments', subAssignments);
  return updatedAssignments;
};

// Remove an assignment that is at the location specified by indices
const removeAssignment = (indices, assignments) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, updatedAssignments);
  array.splice(lastIndex, 1);
  return updatedAssignments;
};

// Creates a tree structure of assignments from an array of assignments with parent Ids
const constructTreeAssignmets = (assignments) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  let map = {};
  let root;

  updatedAssignments.forEach((assignment) => {
    map[assignment.id] = updatedAssignments.find( element => element.id === assignment.parentId );
  }); 

  updatedAssignments.forEach((assignment) => {
    assignment.subAssignments = [];
    if (assignment.parentId === 0) { // parent id === instance id
      root = assignment;
    } else {
      const parentNode = map[assignment.id];
      if (parentNode.subAssignments) {
        parentNode.subAssignments.push(assignment);
      } else {
        parentNode.subAssignments = [assignment];
      }
    }
  });

  return root;
};

// Recursive function to add the 'category' property for each assignment
const addCategories = (assignments) => {

  const addCategory = (modifiabelAssignments) => {
    modifiabelAssignments.forEach((assignment) => {
      const name = assignment.name;
      if (name === 'Exam' || name === 'Exercise' || name === 'Project') {
        assignment.category = name;
      } else {
        assignment.category = 'Other';
      }
      if (assignment.subAssignments.length !== 0) {
        addCategory(assignment.subAssignments);
      }
    });
  };

  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  addCategory(updatedAssignments);
  return updatedAssignments;

};

// Recursive function to format Date type values of the assignments to strings of the format '2023-01-01'
const formatDates = (assignments) => {

  const formatDate = (modifiabelAssignments) => {
    modifiabelAssignments.forEach((assignment) => {
      const date = assignment.date;
      const expiryDate = assignment.expiryDate;
      assignment.date = textFormatServices.formatDateToSlashString(date);
      assignment.expiryDate = textFormatServices.formatDateToSlashString(expiryDate);
      if (assignment.subAssignments.length !== 0) {
        formatDate(assignment.subAssignments);
      }
    });
  };

  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  formatDate(updatedAssignments);
  return updatedAssignments;

};

export default { 
  getSubAssignments, 
  addSubAssignments, 
  removeAssignment, 
  getProperty, 
  setProperty, 
  constructTreeAssignmets, 
  addCategories, 
  formatDates 
};
