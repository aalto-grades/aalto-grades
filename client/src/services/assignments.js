// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

import axios from './axios';
import textFormatServices from './textFormat';
import mockAttainmentsClient from '../mock-data/mockAttainmentsClient';

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

// Function to get mock attainments and assign temporary Ids to the top attainments (the ones with no parents).
// Should eventually be replaced with a function that gets data from the server.
const getSuggestedAttainments = () => { return mockAttainmentsClient; };

// Function to get mock attainments and assign temporary Ids to the top attainments (the ones with no parents).
// Should eventually be replaced with a function that gets data from the server.
const addTemporaryIds = (attainments, temporaryId) => {

  let newTemporaryId = temporaryId;

  const addTemporaryId = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      attainment.temporaryId = newTemporaryId;
      newTemporaryId += 1;
      if (attainment.subAttainments.length !== 0) {
        addTemporaryId(attainment.subAttainments);
      }
    });
  };

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  addTemporaryId(updatedAttainments);
  return [updatedAttainments, newTemporaryId];

};

// Add an attainment to a temporary list of attainments and give it an ID.
const addTemporaryAttainment = (attainments, newAttainment) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  let updatedNewAttainment = JSON.parse(JSON.stringify(newAttainment));
  updatedAttainments.push(updatedNewAttainment);
  return updatedAttainments;
};

// Add an attainment to a temporary list of attainments and give it an ID.
const createTemporaryAttainment = (attainments, newAttainment, temporaryId) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  let updatedNewAttainment = JSON.parse(JSON.stringify(newAttainment));
  updatedNewAttainment.temporaryId = temporaryId;
  updatedAttainments.push(updatedNewAttainment);
  const newTemporaryId = temporaryId + 1;
  return [updatedAttainments, newTemporaryId];
};

// Add an attainment to a temporary list of attainments and give it an ID.
const updateTemporaryAttainment = (attainments, newAttainment) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  updatedAttainments = updatedAttainments.map((attainment) => attainment.temporaryId === newAttainment.temporaryId ? newAttainment : attainment);
  return updatedAttainments;
};

// Add an attainment to a temporary list of attainments and give it an ID.
const deleteTemporaryAttainment = (attainments, newAttainment) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  updatedAttainments = updatedAttainments.filter((attainment) => attainment.temporaryId !== newAttainment.temporaryId);
  console.log(updatedAttainments);
  return updatedAttainments;
};

// The parameter 'indices' used in the following functions is an array of integres 
// that displays the indices of an attainment on different levels.
// EXAMPLE: The indices of the 'attainment 0.1' below would be [0, 1].
/* Attainments = [
    { 
      name: 'attainment 0', 
      date: '',
      subAttainments: [
        { 
          name: 'attainment 0.0', 
          date: '',
          subAttainments: []
        },
        {
          name: 'attainment 0.1', 
          date: '',
          subAttainments: []
        }
      ]
    }
  ]
*/
// Replace indices with attainment IDs if it seems simpler/more effective

// Get sub-attainments from the attainments array (of nested arrays) according to the indices
const getSubAttainments = (indices, attainments) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  let subAttainments = [];
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    subAttainments = updatedAttainments[index].subAttainments;
    updatedAttainments = subAttainments;
  }
  return subAttainments;
};

// Set the proprety of the object that is in the location specified by the indices in the attainments array,
// the property is set to have the value given as a parameter
const setProperty = (indices, attainments, property, value) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAttainments);
  array[lastIndex][property] = value;
  return updatedAttainments;
};

// Same function as above but to be used with attainment IDs instead of indices
/*const setProperty = (id, attainments, property, value) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const assigment = getAttainmentById(updatedAttainments, id);
  assigment[property] = value;
  Object.assign(updatedAttainments, assigment);
  return updatedAttainments;
};*/

// Get the property of an attainment that is at the location specified by indices
const getProperty = (indices, attainments, property) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAttainments);
  return array[lastIndex][property];
};

// Same function as above but to be used with attainment IDs instead of indices
/*const getProperty = (id, attainments, property) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const assigment = getAttainmentById(updatedAttainments, id);
  console.log(assigment[property]);
  return assigment[property];
};*/

// Set the formula attribute an attainment
const setFormulaAttribute = (indices, attainments, attributeIndex, value) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAttainments);
  array[lastIndex]['formulaAttributes'][attributeIndex] = value;
  return updatedAttainments;
};

// Get the formula attribute an attainment
const getFormulaAttribute = (indices, attainments, attributeIndex) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAttainments);
  return array[lastIndex]['formulaAttributes'][attributeIndex];
};

// Add sub-attainments to the attainments array (of nested arrays) according to the indices
const addSubAttainments = (indices, attainments, numOfAttainments, temporaryId) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  let newTemporaryId = temporaryId;
  const defaultExpiryDate = getProperty(indices, updatedAttainments, 'expiryDate');
  const parentId = getProperty(indices, updatedAttainments, 'id');

  let newSubAttainments = [];
  for (let i = 0; i < numOfAttainments; i++) {
    newSubAttainments.push({
      temporaryId: newTemporaryId,
      category: '',
      name: '',
      date: '',
      expiryDate: defaultExpiryDate,
      parentId: parentId,
      affectCalculation: false,
      formulaAttributes: [],
      subAttainments: [],
    });
    newTemporaryId += 1;
  }

  const currentSubAttainments = getSubAttainments(indices, updatedAttainments);
  const subAttainments = currentSubAttainments.concat(newSubAttainments);
  updatedAttainments = setProperty(indices, updatedAttainments, 'subAttainments', subAttainments);
  return [updatedAttainments, newTemporaryId];
};

// Remove an attainment that is at the location specified by indices
const removeAttainment = (indices, attainments) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => acc[current_index].subAttainments, updatedAttainments);
  array.splice(lastIndex, 1);
  return updatedAttainments;
};

// Creates a tree structure of attainments from an array of attainments with parent Ids
const constructTreeAssignmets = (attainments) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  let map = {};
  let root;

  updatedAttainments.forEach((attainment) => {
    map[attainment.id] = updatedAttainments.find(element => element.id === attainment.parentId);
  }); 

  updatedAttainments.forEach((attainment) => {
    attainment.subAttainments = [];
    if (attainment.parentId === 0) { // parent id === instance id
      root = attainment;
    } else {
      const parentNode = map[attainment.id];
      if (parentNode.subAttainments) {
        parentNode.subAttainments.push(attainment);
      } else {
        parentNode.subAttainments = [attainment];
      }
    }
  });

  return root;
};

// Recursive function to add the 'category' property for each attainment
const addCategories = (attainments) => {

  const addCategory = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      const name = attainment.name;
      if (name === 'Exam' || name === 'Attainments' || name === 'Project') {
        attainment.category = name;
      } else {
        attainment.category = 'Other';
      }
      if (attainment.subAttainments.length !== 0) {
        addCategory(attainment.subAttainments);
      }
    });
  };

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  addCategory(updatedAttainments);
  return updatedAttainments;

};

// Recursive function to format Date type values of the attainments to strings of the format '2023-01-01'
const formatDates = (attainments) => {

  const formatDate = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      const date = attainment.date;
      const expiryDate = attainment.expiryDate;
      attainment.date = textFormatServices.formatDateToSlashString(date);
      attainment.expiryDate = textFormatServices.formatDateToSlashString(expiryDate);
      if (attainment.subAttainments.length !== 0) {
        formatDate(attainment.subAttainments);
      }
    });
  };

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  formatDate(updatedAttainments);
  return updatedAttainments;

};

// Recursive function to format strings of the format '2023-01-01' to Date type values
const formatStringsToDates = (attainments) => {

  const formatStringToDate = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      const dateString = attainment.date;
      const expiryDateString = attainment.expiryDate;
      attainment.date = textFormatServices.formatStringToDate(dateString);
      attainment.expiryDate = textFormatServices.formatStringToDate(expiryDateString);
      if (attainment.subAttainments.length !== 0) {
        formatStringToDate(attainment.subAttainments);
      }
    });
  };

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  formatStringToDate(updatedAttainments);
  return updatedAttainments;

};

// Get an attainment from a tree structure of attainments based on its ID
const getAttainmentById = (attainments, attainmentId) => {

  let finalAttainment = {};

  const findAttainment = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      if (attainment.id === attainmentId) {
        finalAttainment = attainment;
        return;
      } else if (attainment.subAttainments.length !== 0) {
        findAttainment(attainment.subAttainments);
      } else {
        return;
      }
    });
  };

  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  findAttainment(updatedAttainments);
  updatedAttainments = finalAttainment;
  return updatedAttainments;

};

// Get an attainment based on its ID, add categories to the attainments, and format the dates of attainments
const getFinalAttainmentById = (allAttainments, attainmentId) => {
  let updatedAttainments = JSON.parse(JSON.stringify(allAttainments));
  //updatedAttainments = [constructTreeAssignmets(updatedAttainments)];  // Not needed if the structure is already a tree
  updatedAttainments = [getAttainmentById(updatedAttainments, attainmentId)];
  updatedAttainments = addCategories(updatedAttainments);
  updatedAttainments = formatDates(updatedAttainments);
  return updatedAttainments;
};

// Get number of attainments from a tree structure, for tests
const getNumOfAttainments = (attainments) => {

  let sum = 0;

  const countAttainment = (modifiabelAttainments) => {
    modifiabelAttainments.forEach((attainment) => {
      sum += 1;
      if (attainment.subAttainments.length !== 0) {
        countAttainment(attainment.subAttainments);
      } else {
        return;
      }
    });
  };

  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  countAttainment(updatedAttainments);
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
  getSuggestedAttainments,
  addTemporaryIds,
  addTemporaryAttainment,
  createTemporaryAttainment,
  updateTemporaryAttainment,
  deleteTemporaryAttainment,
  getSubAttainments, 
  addSubAttainments, 
  removeAttainment, 
  getProperty, 
  setProperty, 
  constructTreeAssignmets, 
  addCategories, 
  formatDates,
  formatStringsToDates,
  getAttainmentById,
  getFinalAttainmentById,
  setFormulaAttribute,
  getFormulaAttribute,
  getNumOfAttainments,
  getExistingAttainments,
  getNewAttainments,
  deleteSubAttainments,
};
