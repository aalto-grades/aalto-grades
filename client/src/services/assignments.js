// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

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
  
// Get sub-assignments from the assignments array (of nested arrays) according to the indices
const addSubAssignments = (indices, assignments, numOfAssignments) => {
  const defaultExpiryDate = getProperty(indices, assignments, 'expiryDate');
  const newSubAssignments = new Array(Number(numOfAssignments)).fill({
    category: '',
    name: '',
    date: '',
    expiryDate: defaultExpiryDate,
    subAssignments: [],
  });
  const currentSubAssignments = getSubAssignments(indices, assignments);
  const subAssignments = currentSubAssignments.concat(newSubAssignments );
  setProperty(indices, assignments, 'subAssignments', subAssignments);
};
  
// Remove an assignment that is at the location specified by indices
const removeAssignment = (indices, assignments) => {
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, assignments);
  array.splice(lastIndex, 1);
};
  
// Get the property of an assignment that is at the location specified by indices
const getProperty = (indices, assignments, property) => {
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, assignments);
  return array[lastIndex][property];
};
  
// Set the proprety of the object that is in the location specified by the indices in the assignments array,
// the property is set to have the value given as a parameter
const setProperty = (indices, assignments, property, value) => {
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAssignments, assignments);
  array[lastIndex][property] = value;
};

const constructTreeAssignmets = (assignments) => {
  const assignmentsMap = assignments.reduce(function(map, node) {
    map[node.id] = node;
    return map;
  }, {});

  let root = [];
  assignments.forEach((assignment) => {
    assignment.subAssignments = [];
    const parentId = assignment.parentId;
    if (parentId === 0) {
      root = assignment;        
    } else {  
      const parentAssignment = assignmentsMap[parentId];
      delete assignment.parentId;
      if (parentAssignment.subAssignments) {
        parentAssignment.subAssignments.push(assignment);
      } else {
        parentAssignment.subAssignments = [assignment];
      }
    }
  });
  return root;
};

export default { getSubAssignments, addSubAssignments, removeAssignment, getProperty, setProperty, constructTreeAssignmets };
