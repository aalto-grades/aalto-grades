// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { JSX } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import { AssessmentModelData } from 'aalto-grades-common/types';

function AssessmentModelsTable(props: {
  data: Array<AssessmentModelData>,
  current: number,
  onClick: (assessmentModel: AssessmentModelData) => void
}): JSX.Element {
  return (
    <Table>
      <TableBody>
        {
          props.data.map((assessmentModel: AssessmentModelData) => {
            return (
              <TableRow
                key={assessmentModel.id}
                hover={true}
                selected={props.current === assessmentModel.id}
                onClick={(): void => props.onClick(assessmentModel)}
              >
                <TableCell>
                  {assessmentModel.name}
                </TableCell>
              </TableRow>
            );
          })
        }
      </TableBody>
    </Table>
  );
}

AssessmentModelsTable.propTypes = {
  data: PropTypes.array,
  current: PropTypes.number,
  onClick: PropTypes.func
};

export default AssessmentModelsTable;
