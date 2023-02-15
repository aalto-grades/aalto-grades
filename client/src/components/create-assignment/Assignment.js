// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import LeafAssignment from './LeafAssignment';
import ParentAssignment from './ParentAssignment';
import subAssignmentServices from '../../services/subAssignments';

const Assignment = ({ indices, assignments, setAssignments }) => {

  const addSubAssignments = (numOfAssignments) => {
    const value = new Array(Number(numOfAssignments)).fill({
      name: '',
      date: '',
      expiryDate: '',
      subAssignments: [],
    });
    const updatedAssignments = JSON.parse(JSON.stringify(assignments));
    subAssignmentServices.setProperty(indices, updatedAssignments, 'subAssignments', value);
    //updatedAssignments[index].subAssignments = value;
    setAssignments(updatedAssignments);
  }; 

  return (
    <>
      {subAssignmentServices.getSubAssignments(indices, assignments).length === 0 ?
        <LeafAssignment 
          indices={indices}
          addSubAssignments={addSubAssignments}
          assignments={assignments} 
          setAssignments={setAssignments} 
        />
        :
        <ParentAssignment
          indices={indices}
          addSubAssignments={addSubAssignments}
          assignments={assignments} 
          setAssignments={setAssignments} 
        />}
    </>
  );
};

Assignment.propTypes = {
  assignments: PropTypes.array,
  setAssignments: PropTypes.func,
  indices: PropTypes.array,
};

export default Assignment;
