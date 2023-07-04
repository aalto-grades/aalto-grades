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

  // Function to delete any attainment.
  deleteAttainment: (attainment: AttainmentData) => void,

  // Function to get a temporarily unique ID for attainments that haven't been
  // added to the database yet.
  getTemporaryId: () => number,

  // The attainment represented by this component. Reference to an attainment
  // in the attainmentTree variable above.
  attainment: AttainmentData,

  formulaAttributeNames: Array<string>,
}): JSX.Element {
  return (
    <>
      {
        (props.attainmentTree.subAttainments && props.attainmentTree.subAttainments.length > 0)
          ?
          <ParentAttainment
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            deleteAttainment={props.deleteAttainment}
            getTemporaryId={props.getTemporaryId}
            attainment={props.attainment}
            formulaAttributeNames={props.formulaAttributeNames}
          />
          :
          <LeafAttainment
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            deleteAttainment={props.deleteAttainment}
            getTemporaryId={props.getTemporaryId}
            attainment={props.attainment}
            formulaAttributeNames={props.formulaAttributeNames}
          />
      }
    </>
  );
}

Attainment.propTypes = {
  attainmentTree: PropTypes.object,
  setAttainmentTree: PropTypes.func,
  deleteAttainment: PropTypes.func,
  getTemporaryId: PropTypes.func,
  attainment: PropTypes.object,
  formulaAttributeNames: PropTypes.array
};

export default Attainment;
