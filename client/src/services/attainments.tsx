// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

import axios from './axios';
import textFormatServices from './textFormat';
import mockAttainmentsClient from '../tests/mock-data/mockAttainmentsClient';
import { AttainmentData } from 'aalto-grades-common/types/attainment';
import { FullResponse, Numeric } from '../types';

// Functions that are (or will be) connected to the server.

async function addAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainment: AttainmentData
): Promise<AttainmentData> {

  const response: FullResponse<{ attainment: AttainmentData }> =
    await axios.post(
      `/v1/courses/${courseId}/assessment-models/${assessmentModelId}/attainments`,
      attainment
    );

  return response.data.data.attainment;
}

async function editAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainment: AttainmentData
): Promise<AttainmentData> {

  const response: FullResponse<{ attainment: AttainmentData }> =
    await axios.put(
      `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
      + `/attainments/${attainment.id}`,
      attainment
    );

  return response.data.data.attainment;
}

async function deleteAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric
): Promise<void> {

  await axios.delete(
    `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
    + `/attainments/${attainmentId}`
  );
}

async function getAttainment(
  courseId: Numeric,
  assessmentModelId: Numeric,
  attainmentId: Numeric,
  tree?: 'children' | 'descendants'
): Promise<AttainmentData> {

  const query: string = tree ? `?tree=${tree}` : '';

  const response: FullResponse<{ attainment: AttainmentData }> =
    await axios.get(
      `/v1/courses/${courseId}/assessment-models/${assessmentModelId}`
      + `/attainments/${attainmentId}${query}`
    );


  return response.data.data.attainment;
}

// Function to get mock attainments.
// Should eventually be replaced with a function that gets data from the server.
function getSuggestedAttainments() {
  return mockAttainmentsClient;
}


// The following functions are used to add temporary ids, and to create, add
// and delete temporary attainments. These functions are mainly used in order
// to complete the functionality of creating, adding and editing attainments
// duing the creation of an instance.

// Function to assign temporary Ids to attainments.
function addTemporaryIds(attainments, temporaryId) {
  let newTemporaryId = temporaryId;
  function addTemporaryId(modifiableAttainments) {
    if (modifiableAttainments.length) {
      modifiableAttainments.forEach((attainment) => {
        attainment.temporaryId = newTemporaryId;
        newTemporaryId += 1;
        if (attainment.subAttainments.length !== 0) {
          addTemporaryId(attainment.subAttainments);
        }
      });
    }
  }

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  addTemporaryId(updatedAttainments);
  return [updatedAttainments, newTemporaryId];
}

// Add an attainment to a temporary list of attainments.
function addTemporaryAttainment(attainments, newAttainment) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const updatedNewAttainment = JSON.parse(JSON.stringify(newAttainment));
  updatedAttainments.push(updatedNewAttainment);
  return updatedAttainments;
}

// Add an attainment to a temporary list of attainments and give it a temporary id.
function createTemporaryAttainment(attainments, newAttainment, temporaryId) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const updatedNewAttainment = JSON.parse(JSON.stringify(newAttainment));
  updatedNewAttainment.temporaryId = temporaryId;
  updatedAttainments.push(updatedNewAttainment);
  const newTemporaryId = temporaryId + 1;
  return [updatedAttainments, newTemporaryId];
}

// Update an attainment in a temporary list of attainments.
function updateTemporaryAttainment(attainments, newAttainment) {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  updatedAttainments = updatedAttainments.map((attainment) => {
    return attainment.temporaryId === newAttainment.temporaryId ? newAttainment : attainment;
  });
  return updatedAttainments;
}

// Delete an attainment from a temporary list of attainments.
function deleteTemporaryAttainment(attainments, newAttainment) {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  updatedAttainments = updatedAttainments.filter((attainment) => {
    return attainment.temporaryId !== newAttainment.temporaryId;
  });

  return updatedAttainments;
}


// The following functions are used to cmoplete the functionality that is needed
// for the components used in CreateAttainmentView and EditAttainmentView

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

// Get an attainment from a tree structure of attainments based on its location defined by indices
function getAttainmentByIndices(indices, attainments) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);

  if (indicesWithoutLast.length > 0) {
    const array = indicesWithoutLast.reduce((acc, current_index) => {
      return acc[current_index].subAttainments, updatedAttainments;
    });
    return array[lastIndex];
  }
  return {};
}

// Get sub-attainments from the attainments array (of nested arrays) according to the indices
function getSubAttainments(indices, attainments) {
  return [];
  /*
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  let subAttainments = [];
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    if (updatedAttainments[index] && updatedAttainments[index].subAttainments)
      subAttainments = updatedAttainments[index].subAttainments;
    updatedAttainments = subAttainments;
  }
  return subAttainments;
  */
}

// Set the proprety of the object that is in the location specified by the indices in the
// attainments array, the property is set to have the value given as a parameter
function setProperty(indices, attainments, property, value) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => {
    return acc[current_index].subAttainments, updatedAttainments;
  });
  array[lastIndex][property] = value;
  return updatedAttainments;
}

// Same function as above but to be used with attainment IDs instead of indices
/*const setProperty = (id, attainments, property, value) => {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const assigment = getAttainmentById(updatedAttainments, id);
  assigment[property] = value;
  Object.assign(updatedAttainments, assigment);
  return updatedAttainments;
};*/

// Get the property of an attainment that is at the location specified by indices
function getProperty(indices, attainments, property) {
  return getAttainmentByIndices(indices, attainments)[property];
}

// Same function as above but to be used with attainment IDs instead of indices
/*const getProperty = (id, attainments, property) => {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const assigment = getAttainmentById(updatedAttainments, id);
  console.log(assigment[property]);
  return assigment[property];
};*/

// Set the formula attribute an attainment
function setFormulaAttribute(indices, attainments, attributeKey, value) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => {
    return acc[current_index].subAttainments, updatedAttainments;
  });
  array[lastIndex]['formulaAttributes'][attributeKey] = value;
  console.log(updatedAttainments);
  return updatedAttainments;
}

// Get the formula attribute an attainment
function getFormulaAttribute(indices, attainments, attributeKey) {
  return getAttainmentByIndices(indices, attainments)['formulaAttributes'][attributeKey];
}

// Add sub-attainments to the attainments array (of nested arrays) according to the indices
function addSubAttainments(indices, attainments, numOfAttainments, temporaryId) {
  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  let newTemporaryId = temporaryId;
  const defaultExpiryDate = getProperty(indices, updatedAttainments, 'expiryDate');
  const parentId = getProperty(indices, updatedAttainments, 'id');

  const newSubAttainments = [];
  for (let i = 0; i < numOfAttainments; i++) {
    newSubAttainments.push({
      temporaryId: newTemporaryId,
      category: '',
      name: '',
      date: '',
      expiryDate: defaultExpiryDate,
      parentId: parentId,
      affectCalculation: false,
      formulaAttributes: {},
      subAttainments: [],
    });
    newTemporaryId += 1;
  }

  const currentSubAttainments = getSubAttainments(indices, updatedAttainments);
  const subAttainments = currentSubAttainments.concat(newSubAttainments);
  updatedAttainments = setProperty(indices, updatedAttainments, 'subAttainments', subAttainments);
  return [updatedAttainments, newTemporaryId];
}

// Remove an attainment that is at the location specified by indices
function removeAttainment(indices, attainments) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const lastIndex = indices[indices.length - 1];
  const indicesWithoutLast = indices.slice(0, -1);
  const array = indicesWithoutLast.reduce((acc, current_index) => {
    return acc[current_index].subAttainments, updatedAttainments;
  });
  array.splice(lastIndex, 1);
  return updatedAttainments;
}

// Creates a tree structure of attainments from an array of attainments with parent Ids
function constructTreeAssignmets(attainments) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  const map = {};
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
}

// Recursive function to add the 'category' property for each attainment
function addCategories(attainments) {

  function addCategory(modifiableAttainments) {
    modifiableAttainments.forEach((attainment) => {
      const name = attainment.name;
      if (name === 'Exam' || name === 'Attainments' || name === 'Project') {
        attainment.category = name;
      } else {
        attainment.category = 'Other';
      }
      if (attainment.subAttainments && attainment.subAttainments.length !== 0) {
        addCategory(attainment.subAttainments);
      }
    });
  }

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  addCategory(updatedAttainments);
  return updatedAttainments;

}

// Recursive function to format Date type values of the attainments to strings
// of the format '2023-01-01'
function formatDates(attainments) {
  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  return updatedAttainments;
}

// Recursive function to format strings of the format '2023-01-01' to Date type values
function formatStringsToDates(attainments) {

  function formatStringToDate(modifiableAttainments) {
    modifiableAttainments.forEach((attainment) => {
      const dateString = attainment.date;
      const expiryDateString = attainment.expiryDate;
      attainment.date = textFormatServices.formatStringToDate(dateString);
      attainment.expiryDate = textFormatServices.formatStringToDate(expiryDateString);
      if (attainment.subAttainments.length !== 0) {
        formatStringToDate(attainment.subAttainments);
      }
    });
  }

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  formatStringToDate(updatedAttainments);
  return updatedAttainments;
}

// Get an attainment from a tree structure of attainments based on its ID
function getAttainmentById(attainments, attainmentId) {

  let finalAttainment = {};
  function findAttainment(modifiableAttainments) {
    if (modifiableAttainments.length) {
      modifiableAttainments.forEach((attainment) => {
        if (attainment.id === attainmentId) {
          finalAttainment = attainment;
          return;
        } else if (attainment.subAttainments.length !== 0) {
          findAttainment(attainment.subAttainments);
        } else {
          return;
        }
      });
    }
  }

  let updatedAttainments = JSON.parse(JSON.stringify(attainments));
  findAttainment(updatedAttainments);
  updatedAttainments = finalAttainment;
  return updatedAttainments;

}

// Get an attainment based on its ID, add categories to the attainments, and
// format the dates of attainments
function getFinalAttainmentById(allAttainments, attainmentId) {
  let updatedAttainments = JSON.parse(JSON.stringify(allAttainments));
  // Not needed if the structure is already a tree
  //updatedAttainments = [constructTreeAssignmets(updatedAttainments)];
  updatedAttainments = [getAttainmentById(updatedAttainments, attainmentId)];
  updatedAttainments = addCategories(updatedAttainments);
  updatedAttainments = formatDates(updatedAttainments);
  return updatedAttainments;
}

// Get number of attainments from a tree structure, for tests
function getNumOfAttainments(attainments) {

  let sum = 0;
  function countAttainment(modifiableAttainments) {
    modifiableAttainments.forEach((attainment) => {
      sum += 1;
      if (attainment.subAttainments.length !== 0) {
        countAttainment(attainment.subAttainments);
      } else {
        return;
      }
    });
  }

  const updatedAttainments = JSON.parse(JSON.stringify(attainments));
  countAttainment(updatedAttainments);
  return sum;

}

// Get the attainments that have ids so that they are already existing in the database
function getExistingAttainments(attainments) {

  const existingAttainments = [];
  function findExisting(modifiableAttainments) {
    modifiableAttainments.forEach((attainment) => {
      if (attainment.id) {
        existingAttainments.push(attainment);
      }
      if (attainment.subAttainments && attainment.subAttainments.length !== 0) {
        findExisting(attainment.subAttainments);
      }
    });
  }

  let updatedAattainments = JSON.parse(JSON.stringify(attainments));
  findExisting(updatedAattainments);
  updatedAattainments = existingAttainments;
  return updatedAattainments;
}

// Get the attainments that don't have ids so that they aren't existing in the database
function getNewAttainments(attainments) {

  const newAttainments = [];
  function findNew(modifiableAttainments) {
    modifiableAttainments.forEach((attainment) => {
      if (!attainment.id) {
        newAttainments.push(attainment);
      } else if (attainment.subAttainments && attainment.subAttainments.length !== 0) {
        findNew(attainment.subAttainments);
      }
    });
  }

  let updatedAattainments = JSON.parse(JSON.stringify(attainments));
  findNew(updatedAattainments);
  updatedAattainments = newAttainments;
  return updatedAattainments;
}

export default {
  addAttainment,
  editAttainment,
  deleteAttainment,
  getAttainment,
  getSuggestedAttainments,
  addTemporaryIds,
  addTemporaryAttainment,
  createTemporaryAttainment,
  updateTemporaryAttainment,
  deleteTemporaryAttainment,
  getSubAttainments,
  addSubAttainments,
  removeAttainment,
  getAttainmentByIndices,
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
  getNewAttainments
};
