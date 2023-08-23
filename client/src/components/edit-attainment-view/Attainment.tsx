// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types';
import { JSX } from 'react';

import LeafAttainment from './LeafAttainment';
import ParentAttainment from './ParentAttainment';

// Parent component for the components LeafAttainment and ParentAttainment

export default function Attainment(props: {
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

  paramsFromParent?: object,
  setTouched: () => void
}): JSX.Element {
  return (
    <>
      {
        (props.attainment.subAttainments && props.attainment.subAttainments.length > 0) ? (
          <ParentAttainment
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            deleteAttainment={props.deleteAttainment}
            getTemporaryId={props.getTemporaryId}
            attainment={props.attainment}
            paramsFromParent={props.paramsFromParent}
            setTouched={props.setTouched}
          />
        ) : (
          <LeafAttainment
            attainmentTree={props.attainmentTree}
            setAttainmentTree={props.setAttainmentTree}
            deleteAttainment={props.deleteAttainment}
            getTemporaryId={props.getTemporaryId}
            attainment={props.attainment}
            paramsFromParent={props.paramsFromParent}
            setTouched={props.setTouched}
          />
        )
      }
    </>
  );
}
