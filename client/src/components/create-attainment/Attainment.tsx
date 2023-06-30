// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import PropTypes from 'prop-types';
import LeafAttainment from './LeafAttainment';
import ParentAttainment from './ParentAttainment';
import { AttainmentData } from 'aalto-grades-common/types';

// Parent component for the components LeafAttainment and ParentAttainment

function Attainment(props: {
  // The full tree of attainments being considered
  attainmentTree: AttainmentData,

  /*
   * Setter for attainmentTree above. Whenever attainmentTree has been changed,
   * call setAttainmentTree in the following way so React will re-render the
   * view: setAttainmentTree(structuredClone(attainmentTree))
   *
   * structuredClone is necessary because objects are passed by reference and
   * otherwise a re-render will not be triggered.
   */
  setAttainmentTree: (attainmentTree: AttainmentData) => void,

  // The attainment represented by this component. Reference to an attainment
  // in the attainmentTree variable above.
  attainment: AttainmentData,

  formulaAttributeNames: any,
  removeAttainment: any
}) {
  return (
    <>
      {
        (props.attainmentTree.subAttainments && props.attainmentTree.subAttainments.length > 0)
          ?
          <ParentAttainment
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            attainment={props.attainment}
            removeAttainment={props.removeAttainment}
            formulaAttributeNames={props.formulaAttributeNames}
          />
          :
          <LeafAttainment
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            attainment={props.attainment}
            removeAttainment={props.removeAttainment}
            formulaAttributeNames={props.formulaAttributeNames}
          />
      }
    </>
  );
}

Attainment.propTypes = {
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func,
  indices: PropTypes.array,
  formulaAttributeNames: PropTypes.array,
  removeAttainment: PropTypes.func
};

export default Attainment;
