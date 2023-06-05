// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import LeafAssignment from './LeafAssignment';
import ParentAssignment from './ParentAssignment';
import assignmentServices from '../../services/assignments';

// Parent component for the components LeafAssignment and ParentAssignment

const Assignment = ({ indices, attainments, setAttainments, removeAttainment, formulaAttributeNames, temporaryId, setIncrementId }) => {

  const addSubAttainments = (numOfAttainments) => {
    const [updatedAttainments, newTemporaryId] = assignmentServices.addSubAttainments(indices, attainments, numOfAttainments, temporaryId);
    setAttainments(updatedAttainments);
    if (setIncrementId)
      setIncrementId(newTemporaryId);
  };

  return (
    <>
      {assignmentServices.getSubAttainments(indices, attainments).length === 0 ?
        <LeafAssignment
          indices={indices}
          addSubAttainments={addSubAttainments}
          attainments={attainments}
          setAttainments={setAttainments}
          removeAttainment={removeAttainment}
          formulaAttributeNames={formulaAttributeNames}
        />
        :
        <ParentAssignment
          indices={indices}
          addSubAttainments={addSubAttainments}
          attainments={attainments}
          setAttainments={setAttainments}
          removeAttainment={removeAttainment}
          formulaAttributeNames={formulaAttributeNames}
          temporaryId={temporaryId}
          setIncrementId={setIncrementId}
        />}
    </>
  );
};

Assignment.propTypes = {
  attainments: PropTypes.array,
  setAttainments: PropTypes.func,
  indices: PropTypes.array,
  removeAttainment: PropTypes.func,
  formulaAttributeNames: PropTypes.array,
  temporaryId: PropTypes.number,
  setIncrementId: PropTypes.func
};

export default Assignment;
