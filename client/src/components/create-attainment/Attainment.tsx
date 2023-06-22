// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import LeafAttainment from './LeafAttainment';
import ParentAttainment from './ParentAttainment';
import attainmentServices from '../../services/attainments';

// Parent component for the components LeafAttainment and ParentAttainment

function Attainment({
  indices, attainments, setAttainments, removeAttainment,
  formulaAttributeNames, temporaryId, setIncrementId
}) {

  function addSubAttainments(numOfAttainments): void {
    const [updatedAttainments, newTemporaryId] = attainmentServices.addSubAttainments(
      indices, attainments, numOfAttainments, temporaryId
    );

    setAttainments(updatedAttainments);
    if (setIncrementId)
      setIncrementId(newTemporaryId);
  }

  return (
    <>
      {attainmentServices.getSubAttainments(indices, attainments).length === 0 ?
        <LeafAttainment
          indices={indices}
          addSubAttainments={addSubAttainments}
          attainments={attainments}
          setAttainments={setAttainments}
          removeAttainment={removeAttainment}
          formulaAttributeNames={formulaAttributeNames}
        />
        :
        <ParentAttainment
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
}

Attainment.propTypes = {
  attainments: PropTypes.array,
  setAttainments: PropTypes.func,
  indices: PropTypes.array,
  removeAttainment: PropTypes.func,
  formulaAttributeNames: PropTypes.array,
  temporaryId: PropTypes.number,
  setIncrementId: PropTypes.func
};

export default Attainment;
