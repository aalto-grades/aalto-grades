// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import LeafAssignment from './LeafAssignment';
import ParentAssignment from './ParentAssignment';
import subAssignmentServices from '../../services/assignments';

// Parent component for the components LeafAssignment and ParentAssignment 

const Assignment = ({ indices, assignments, setAssignments, removeAssignment }) => {

  const addSubAssignments = (numOfAssignments) => {
    const updatedAssignments = JSON.parse(JSON.stringify(assignments));
    subAssignmentServices.addSubAssignments(indices, updatedAssignments, numOfAssignments);
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
          removeAssignment={removeAssignment}
        />
        :
        <ParentAssignment
          indices={indices}
          addSubAssignments={addSubAssignments}
          assignments={assignments} 
          setAssignments={setAssignments} 
          removeAssignment={removeAssignment}
        />}
    </>
  );
};

Assignment.propTypes = {
  assignments: PropTypes.array,
  setAssignments: PropTypes.func,
  indices: PropTypes.array,
  removeAssignment: PropTypes.func
};

export default Assignment;
