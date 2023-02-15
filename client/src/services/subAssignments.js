// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

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
  const lastIndex = indices.pop();
  const array = indices.reduce((acc, current_index) => acc[current_index].subAssignments, assignments);
  array[lastIndex][property] = value;
};

export default { getSubAssignments, setProperty };
