// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// A Dialog component for uploading a file

const instructions = 'Upload a CSV file with the header "studentNo" and headers matching to the study \
  attainment tags you wish to add grades for. You can se an example of a CSV file of the correct format below.';

const FileLoadDialog = ({ handleClose, open }) => {
  const [file, setFile] = useState(null);

  const getFileName = file => file.split('\\').pop();

  const uploadFile = () => {
    // TODO: validate that a file is selected, else display error
    // TODO: send file to backend
    console.log('sent: ' + getFileName(file));
  };

  return (
    <Dialog open={open} >
      <DialogTitle >Add Grades from File</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>{instructions}</DialogContentText>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', columnGap: 2 }}>
          <Button variant='contained' component='label'>
            Upload file
            <input hidden type='file' accept='.csv' onChange={(event) => setFile(event.target.value)} />  {/* multiple?? */}
          </Button>
          <Typography>{file ? getFileName(file) : 'Select a file'}</Typography>  {/* Name of the file here */}
        </Box>
      </DialogContent>
      <DialogActions sx={{ pr: 4, pb: 3 }}>
        <Button size='medium' onClick={() => {
          handleClose();
          setFile(null);
        }}>
          Cancel
        </Button>
        <Button size='medium' variant='outlined' onClick={() => {
          uploadFile();
          handleClose();
          setFile(null);
        }}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FileLoadDialog.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
};

export default FileLoadDialog;