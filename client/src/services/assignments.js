// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

import axios from './axios';
import textFormatServices from './textFormat';

const addAttainment = async (courseId, instanceId, attainment) => {
  const response = await axios.post(
    `/v1/courses/${courseId}/instances/${instanceId}/attainments`,
    attainment);
  return response.data.data;
};

const editAttainment = async (courseId, instanceId, attainment) => {
  const response = await axios.put(
    `/v1/courses/${courseId}/instances/${instanceId}/attainments/${attainment.id}`,
    attainment);
  return response.data.data;
};

// The parameter 'indices' used in the following functions is an array of integres 
// that displays the indices of an assignment on different levels.
// EXAMPLE: The indices of the 'assignment 0.1' below would be [0, 1].
/* Assignments = [
    { 
      name: 'assignment 0', 
      date: '',
      subAttainments: [
        { 
          name: 'assignment 0.0', 
          date: '',
          subAttainments: []
        },
        {
          name: 'assignment 0.1', 
          date: '',
          subAttainments: []
        }
      ]
    }
  ]
*/
// Replace indices with assignment IDs if it seems simpler/more effective

// Get sub-assignments from the assignments array (of nested arrays) according to the indices
const getSubAttainments = (indices, assignments) => {
  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  let subAttainments = [];
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    subAttainments = updatedAssignments[index].subAttainments;
    updatedAssignments = subAttainments;
  }
  return subAttainments;
};

// Set the proprety of the object that is in the location specified by the indices in the assignments array,
// the property is set to have the value given as a parameter
const setProperty = (indices, assignments, property, value) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAssignments);
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
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAssignments);
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
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAssignments);
  array[lastIndex]['formulaAttributes'][attributeIndex] = value;
  return updatedAssignments;
};

// Get the formula attribute an assignment
const getFormulaAttribute = (indices, assignments, attributeIndex) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAssignments);
  return array[lastIndex]['formulaAttributes'][attributeIndex];
};

// Add sub-assignments to the assignments array (of nested arrays) according to the indices
const addSubAttainments = (indices, assignments, numOfAssignments) => {
  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const defaultExpiryDate = getProperty(indices, updatedAssignments, 'expiryDate');
  const parentId = getProperty(indices, updatedAssignments, 'id');
  const newSubAttainments = new Array(Number(numOfAssignments)).fill({
    category: '',
    name: '',
    date: '',
    expiryDate: defaultExpiryDate,
    parentId: parentId,
    affectCalculation: false,
    formulaAttributes: [],
    subAttainments: [],
  });
  const currentSubAttainments = getSubAttainments(indices, updatedAssignments);
  const subAttainments = currentSubAttainments.concat(newSubAttainments);
  updatedAssignments = setProperty(indices, updatedAssignments, 'subAttainments', subAttainments);
  return updatedAssignments;
};

// Remove an assignment that is at the location specified by indices
const removeAssignment = (indices, assignments) => {
  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAssignments);
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
    assignment.subAttainments = [];
    if (assignment.parentId === 0) { // parent id === instance id
      root = assignment;
    } else {
      const parentNode = map[assignment.id];
      if (parentNode.subAttainments) {
        parentNode.subAttainments.push(assignment);
      } else {
        parentNode.subAttainments = [assignment];
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
      if (assignment.subAttainments.length !== 0) {
        addCategory(assignment.subAttainments);
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
      if (assignment.subAttainments.length !== 0) {
        formatDate(assignment.subAttainments);
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
      if (assignment.subAttainments.length !== 0) {
        formatStringToDate(assignment.subAttainments);
      }
    });
  };

  const updatedAssignments = JSON.parse(JSON.stringify(assignments));
  formatStringToDate(updatedAssignments);
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
      } else if (assignment.subAttainments.length !== 0) {
        findAssignment(assignment.subAttainments);
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
      if (assignment.subAttainments.length !== 0) {
        countAssignment(assignment.subAttainments);
      } else {
        return;
      }
    });
  };

  let updatedAssignments = JSON.parse(JSON.stringify(assignments));
  countAssignment(updatedAssignments);
  return sum;

};

const getExistingAttainments = (attainments) => {

  let existingAttainments = [];

  const findExisting = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      if (attainment.id) {
        existingAttainments.push(attainment);
      }
      if (attainment.subAttainments && attainment.subAttainments.length !== 0) {
        findExisting(attainment.subAttainments);
      }
    });
  };

  let updatedAattainments = JSON.parse(JSON.stringify(attainments));
  findExisting(updatedAattainments);
  updatedAattainments = existingAttainments;
  return updatedAattainments;
};

const getNewAttainments = (attainments) => {

  let newAttainments = [];

  const findNew = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      if (!attainment.id) {
        newAttainments.push(attainment);
      } else if (attainment.subAttainments && attainment.subAttainments.length !== 0) {
        findNew(attainment.subAttainments);
      }
    });
  };

  let updatedAattainments = JSON.parse(JSON.stringify(attainments));
  findNew(updatedAattainments);
  updatedAattainments = newAttainments;
  return updatedAattainments;
};

const deleteSubAttainments = (attainments) => {
  let updatedAattainments = JSON.parse(JSON.stringify(attainments));
  updatedAattainments.forEach((attainment) => delete attainment.subAttainments);
  return updatedAattainments;
};

export default { 
  addAttainment,
  editAttainment,
  getSubAttainments, 
  addSubAttainments, 
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
  getNumOfAssignments,
  getExistingAttainments,
  getNewAttainments,
  deleteSubAttainments,
};
