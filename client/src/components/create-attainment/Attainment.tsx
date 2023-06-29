// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import LeafAttainment from './LeafAttainment';
import ParentAttainment from './ParentAttainment';
import attainmentServices from '../../services/attainments';
import { AttainmentData } from 'aalto-grades-common/types';

// Parent component for the components LeafAttainment and ParentAttainment

function Attainment(props: {
  attainmentTree: AttainmentData,
  setAttainmentTree: (attainmentTree: AttainmentData) => void,
  indices: Array<number>,
  removeAttainment: any,
  formulaAttributeNames: any,
  temporaryId: any,
  setIncrementId: any
}) {

  function addSubAttainments(numOfAttainments: number): void {
    /*const [updatedAttainments, newTemporaryId] = attainmentServices.addSubAttainments(
      indices, attainments, numOfAttainments, temporaryId
    );

    setAttainments(updatedAttainments);
    if (setIncrementId)
      setIncrementId(newTemporaryId);*/
  }

  return (
    <>
      {
        (!props.attainmentTree.subAttainments || props.attainmentTree.subAttainments.length === 0) ?
          <LeafAttainment
            indices={props.indices}
            addSubAttainments={addSubAttainments}
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            removeAttainment={props.removeAttainment}
            formulaAttributeNames={props.formulaAttributeNames}
          />
          :
          <ParentAttainment
            indices={props.indices}
            addSubAttainments={addSubAttainments}
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            removeAttainment={props.removeAttainment}
            formulaAttributeNames={props.formulaAttributeNames}
            temporaryId={props.temporaryId}
            setIncrementId={props.setIncrementId}
          />
      }
    </>
  );
}

Attainment.propTypes = {
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func,
  indices: PropTypes.array,
  removeAttainment: PropTypes.func,
  formulaAttributeNames: PropTypes.array,
  temporaryId: PropTypes.number,
  setIncrementId: PropTypes.func
};

export default Attainment;
