// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import InstanceTableHead from './InstanceTableHead';
import InstanceTableRow from './InstanceTableRow';
import sortingServices from '../../services/sorting';


const InstancesTable = ({ data, current, onClick }) => {
  return(
    <Table>
      <TableHead>
        <InstanceTableHead/>
      </TableHead>
      <TableBody>
        {data.sort((a, b) => sortingServices.sortByDate(a.startDate, b.startDate))
          .slice()
          .map((instance) => (
            <InstanceTableRow key={instance.id} instance={instance} onClick={onClick} selected={current === instance.id} />
          ))}
      </TableBody>
    </Table>
  );
};

InstancesTable.propTypes = {
  data: PropTypes.array,
  current: PropTypes.number,
  onClick: PropTypes.func
};
    
export default InstancesTable;