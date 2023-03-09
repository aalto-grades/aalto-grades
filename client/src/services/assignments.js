// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

import axios from './axios';
import textFormatServices from './textFormat';

const addAttainment = async (courseId, instanceId, attainment) => {
  const response = await axios.post(`/v1/courses/${courseId}/instances/${instanceId}/attainments`, attainment);
  return response.data.data;
};

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
// Replace indices with assignment IDs if it seems simpler/more effective

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

// Same function as above but to be used with assignment IDs instead of indices
/*const setProperty = (id, assignments, property, value) => {
  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const assigment = getAssignmentById(updatedAssignments, id);
  assigment[property] = value;
  Object.assign(updatedAssignments, assigment);
  return updatedAssignments;
};*/

// Get the property of an assignment that is at the location specified by indices
const getProperty = (indices, assignments, property) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, updatedAssignments);
  return array[lastIndex][property];
};

// Same function as above but to be used with assignment IDs instead of indices
/*const getProperty = (id, assignments, property) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const assigment = getAssignmentById(updatedAssignments, id);
  console.log(assigment[property]);
  return assigment[property];
};*/

// Set the formula attribute an assignment
const setFormulaAttribute = (indices, assignments, attributeIndex, value) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, updatedAssignments);
  array[lastIndex]['formulaAttributes'][attributeIndex] = value;
  return updatedAssignments;
};

// Get the formula attribute an assignment
const getFormulaAttribute = (indices, assignments, attributeIndex) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, updatedAssignments);
  return array[lastIndex]['formulaAttributes'][attributeIndex];
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
    affectCalculation: false,
    formulaAttributes: [],
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
    map[assignment.id] = updatedAssignments.find(element => element.id === assignment.parentId);
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
      if (name === 'Exam' || name === 'Assignments' || name === 'Project') {
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

// Recursive function to format strings of the format '2023-01-01' to Date type values
const formatStringsToDates = (assignments) => {

  const formatStringToDate = (modifiabelAssignments) => {
    modifiabelAssignments.forEach((assignment) => {
      const dateString = assignment.date;
      const expiryDateString = assignment.expiryDate;
      assignment.date = textFormatServices.formatStringToDate(dateString);
      assignment.expiryDate = textFormatServices.formatStringToDate(expiryDateString);
      if (assignment.subAssignments.length !== 0) {
        formatStringToDate(assignment.subAssignments);
      }
    });
  };

  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  formatStringsToDates(updatedAssignments);
  return updatedAssignments;

};

// Get an assignment from a tree structure of assignments based on its ID
const getAssignmentById = (assignments, assignmentId) => {

  let finalAssignment = {};

  const findAssignment = (modifiabelAssignments) => {
    modifiabelAssignments.forEach((assignment) => {
      if (assignment.id === assignmentId) {
        finalAssignment = assignment;
        return;
      } else if (assignment.subAssignments.length !== 0) {
        findAssignment(assignment.subAssignments);
      } else {
        return;
      }
    });
  };

  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  findAssignment(updatedAssignments);
  updatedAssignments = finalAssignment;
  return updatedAssignments;

};

// Get an assignment based on its ID, add categories to the assignments, and format the dates of assignments
const getFinalAssignmentById = (allAssignments, assignmentId) => {
  let updatedAssignments = JSON.parse(JSON.stringify(allAssignments));
  //updatedAssignments = [constructTreeAssignmets(updatedAssignments)];  // Not needed if the structure is already a tree
  updatedAssignments = [getAssignmentById(updatedAssignments, assignmentId)];
  updatedAssignments = addCategories(updatedAssignments);
  updatedAssignments = formatDates(updatedAssignments);
  return updatedAssignments;
};

// Get number of assignments from a tree structure, for tests
const getNumOfAssignments = (assignments) => {

  let sum = 0;

  const countAssignment = (modifiabelAssignments) => {
    modifiabelAssignments.forEach((assignment) => {
      sum += 1;
      if (assignment.subAssignments.length !== 0) {
        countAssignment(assignment.subAssignments);
      } else {
        return;
      }
    });
  };

  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  countAssignment(updatedAssignments);
  return sum;

};

export default { 
  getSubAssignments, 
  addSubAssignments, 
  removeAssignment, 
  getProperty, 
  setProperty, 
  constructTreeAssignmets, 
  addCategories, 
  formatDates,
  formatStringsToDates,
  getAssignmentById,
  getFinalAssignmentById,
  setFormulaAttribute,
  getFormulaAttribute,
  getNumOfAssignments
};
