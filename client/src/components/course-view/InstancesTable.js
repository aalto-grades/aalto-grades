import React from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import InstanceTableHead from './InstanceTableHead';
import InstanceTableRow from './InstanceTableRow';
import sortingServices from '../../services/sorting';


const InstancesTable = ({data}) => {
  return(
    <Table>
      <TableHead>
        <InstanceTableHead/>
      </TableHead>
      <TableBody>
        {data.sort((a, b) => sortingServices.sortByDate(a.startDate, b.startDate))
          .slice()
          .map((instance) => (
            <InstanceTableRow instance={instance} key={instance.id}/>
          ))}
      </TableBody>
    </Table>
  );
};

InstancesTable.propTypes = {
  data: PropTypes.array
};
    
export default InstancesTable;