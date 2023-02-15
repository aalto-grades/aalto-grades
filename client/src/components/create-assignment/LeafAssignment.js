// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SimpleDialog from './SimpleDialog';
import StringTextField from './StringTextField';
import DateTextField from './DateTextField';

const nameData = {
  fieldId: 'assignmentName',
  fieldLabel: 'Name'
};
  
const dateData = {
  fieldId: 'assignmentDate',
  fieldLabel: 'Date'
};
    
const expiryData = {
  fieldId: 'expiryDate',
  fieldLabel: 'Expiry Date'
};

const LeafAssignment = ({ indices, addSubAssignments, setAssignments, assignments }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: 2, 
      borderRadius: 2,
      px: 3,
      py: 1,
      mb: 1
    }}>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridTemplateRows: 'auto',
        columnGap: 3,
        rowGap: 1,
        mt: 2,
      }}>
        <StringTextField fieldData={nameData} indices={indices} setAssignments={setAssignments} assignments={assignments}/>
        <DateTextField fieldData={dateData} indices={indices} setAssignments={setAssignments} assignments={assignments}/>
        <DateTextField fieldData={expiryData} indices={indices} setAssignments={setAssignments} assignments={assignments}/>
      </Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignSelf: 'flex-end',
      }}>
        <Button size='small' sx={{ my: 1 }} onClick={handleClickOpen}>
          Create sub-assignments
        </Button>
        <SimpleDialog
          open={openDialog}
          onClose={handleClose}
          addSubAssignments={addSubAssignments}
        />
      </Box>
    </Box>
  );
};

LeafAssignment.propTypes = {
  addSubAssignments: PropTypes.func,
  indices: PropTypes.array,
  assignments: PropTypes.array,
  setAssignments: PropTypes.func
};

export default LeafAssignment;
