// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, createRef } from 'react';
import { useParams } from 'react-router-dom';
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
import AlertSnackbar from '../alerts/AlertSnackbar';
import gradesService from '../../services/grades';
import mockStudentGrades from '../../mock-data/mockStudentGrades';

// A Dialog component for uploading a file

const instructions = 'Upload a CSV file with the header "studentNo" and headers matching to the study \
  attainment tags you wish to add grades for. You can see an example of a CSV file of the correct format below.';
const exampleText = 'A student with the student number 222222 has gotten 8 points from the attainment \'C3I9A1\' and 7 points from attainment \'C3I9A2\'.';
const errorInstructions = 'The input file could not be processed because of the issues listed below. They need to be fixed.';

const loadingMsg = { msg: 'Importing grades...', severity: 'info' };
const successMsg = { msg: 'File processed successfully, grades imported.', severity: 'success' };
const errorMsg = { msg: 'There was an issue progressing the file, the grades were not imported.', severity: 'error' };

const FileLoadDialog = ({ instanceId, handleClose, open, returnImportedGrades }) => {
  let { courseId } = useParams();
  const fileInput = createRef();

  // state variables handling the alert messages
  const [snackPack, setSnackPack] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

  // useEffect in charge of handling the back-to-back alerts
  // makes the previous disappear before showing the new one
  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  const [fileName, setFileName] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [fileErrors, setFileErrors] = useState([]);

  const uploadFile = async () => {
    setSnackPack((prev) => [...prev, loadingMsg]);
    try {
      await gradesService.importCsv(courseId, instanceId, fileInput.current.files[0]);

      setSnackPack((prev) => [...prev, successMsg]);

      if (returnImportedGrades) {
        // TODO: replace mock grades with response from backend
        // or fetch updated grades from backend
        returnImportedGrades(mockStudentGrades);
      }

      handleClose();
      setFileName(null);
    } catch (err) {
      console.log(err);
      if (err.response.status === 400 && err.response.data.success === false ) {
        setFileErrors(err.response.data.errors);
      }
      setSnackPack((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <>
      <Dialog open={open} transitionDuration={{ exit: 800 }}>
        <DialogTitle >Add Grades from File</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
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
            <Button id='ag_select_file_btn' component='label'>
              Upload file
              <input 
                hidden
                name='file_input' 
                ref={fileInput}
                type='file' 
                accept='.csv' 
                onChange={(event) => {
                  event.preventDefault();
                  if (event.target.value) { // new input -> clear errors
                    setValidationError('');
                    setFileErrors([]);
                  }
                  setFileName(fileInput.current.files[0].name);
                }} 
              />  {/* accept multiple?? */}
            </Button>
            <Typography>{fileName ?? 'Select a file'}</Typography>
          </Box>
          { validationError && <FormHelperText error={true}>{validationError}</FormHelperText> }
          { fileErrors.length !== 0 && 
            <>
              <Typography id={'file_content_errors'} sx={{ mt: 2 }}>{errorInstructions}</Typography>
              { fileErrors.map(err => <FormHelperText key={err} error={true}>{err}</FormHelperText>) }
            </>
          }
        </DialogContent>
        <DialogActions sx={{ pr: 4, pb: 3 }}>
          <Button size='medium' onClick={() => {
            handleClose();
            setFileName(null);
            setValidationError('');
            setFileErrors([]);
          }}>
            Cancel
          </Button>
          <Button 
            id='ag_confirm_file_upload_btn' 
            size='medium' 
            variant='outlined' 
            onClick={() => {
              if (!fileName) {
                setValidationError('You must select a csv file to submit');
                return;
              }
              uploadFile();
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar messageInfo={messageInfo} setMessageInfo={setMessageInfo} open={alertOpen} setOpen={setAlertOpen} />
    </>
  );
};

FileLoadDialog.propTypes = {
  instanceId: PropTypes.number,
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  returnImportedGrades: PropTypes.func
};

export default FileLoadDialog;