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
import FormHelperText from '@mui/material/FormHelperText';

// A Dialog component for uploading a file

const instructions = 'Upload a CSV file with the header "studentNo" and headers matching to the study \
  attainment tags you wish to add grades for. You can see an example of a CSV file of the correct format below.';
const exampleText = 'A student with the student number 222222 has gotten 8 points from the attainment \'C3I9A1\' and 7 points from attainment \'C3I9A2\'.';

const FileLoadDialog = ({ handleClose, open }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const getFileName = file => file.split('\\').pop();

  const uploadFile = () => {
    // TODO: validate csv ?? 
    // TODO: send file to backend
    console.log('sent: ' + getFileName(file));
  };

  return (
    <Dialog open={open} >
      <DialogTitle >Add Grades from File</DialogTitle>
      <DialogContent sx={{ pr: 6 }}>
        <DialogContentText sx={{ mb: 3, color: 'black' }}>{instructions}</DialogContentText>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', columnGap: 2, mb: 3 }}>
          <Typography variant='body2' sx={{ color: 'infoGrey' }}>
            {exampleText}
          </Typography>
          <Box
            component="img"
            sx={{
              height: 90,
              width: 283,
              boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)'
            }}
            alt="A picture of a sheet with three columns. First one is student numbers (StudentNo), the next is points from attainment C3I9A1 and the third column is points from attainment C3I9A2."
            src="/Import-grades-file-example.jpg"
          />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', columnGap: 2 }}>
          <Button component='label'>
            Upload file
            <input 
              hidden 
              type='file' 
              accept='.csv' 
              onChange={(event) => {
                if (event.target.value) {
                  setError('');
                }
                setFile(event.target.value);
              }} 
            />  {/* accept multiple?? */}
          </Button>
          <Typography>{file ? getFileName(file) : 'Select a file'}</Typography>  {/* Name of the file here */}
        </Box>
        <FormHelperText error={error !== ''}>{error}</FormHelperText>
      </DialogContent>
      <DialogActions sx={{ pr: 4, pb: 3 }}>
        <Button size='medium' onClick={() => {
          handleClose();
          setFile(null);
          setError('');
        }}>
          Cancel
        </Button>
        <Button size='medium' variant='outlined' onClick={() => {
          if (!file) {
            setError('You must select a csv file to submit');
            return;
          }
          uploadFile();
          handleClose();
          setFile(null);
          setError('');
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