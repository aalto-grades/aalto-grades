// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AlertSnackbar from '../alerts/AlertSnackbar';
import gradesService from '../../services/grades';
import { Message } from '../../types/general';

// A Dialog component for exporting Sisu grades CSV.
const instructions =
  'Set the completion language and assesment date for the grading, these values'
  + ' are optional. Click export to export the grades.';

const loadingMsg: Message = {
  msg: 'Fetching Sisu CSV...',
  severity: 'info'
};

const successMsg: Message = {
  msg: 'Final grades exported to Sisu CSV format succesfully.',
  severity: 'success'
};

const errorMsg: Message = {
  msg: 'Fetching CSV failed, please try again. Make sure grades have been calculated before exporting.',
  severity: 'error'
};

// Available completion languages used in Sisu.
const languageOptions = [
  {
    id: 'fi',
    language: 'Finnish'
  },
  {
    id: 'sv',
    language: 'Swedish'
  },
  {
    id: 'en',
    language: 'English'
  },
  {
    id: 'es',
    language: 'Spanish'
  },
  {
    id: 'ja',
    language: 'Japanese'
  },
  {
    id: 'zh',
    language: 'Chinese'
  },
  {
    id: 'pt',
    language: 'Portuguese'
  },
  {
    id: 'fr',
    language: 'French'
  },
  {
    id: 'de',
    language: 'German'
  },
  {
    id: 'ru',
    language: 'Russian'
  }
];

const SisuExportDialog = ({ open, handleClose }) => {
  const { courseId, instanceId }: any = useParams();

  // state variables handling the alert messages.
  const [snackPack, setSnackPack] = useState<any>([]);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [messageInfo, setMessageInfo] = useState<Message | undefined>(undefined);

  // state variables handling the assessment date and completion language.
  const [assessmentDate, setAssessmentDate] = useState<any>(null);
  const [completionLanguage, setCompletionLanguage] = useState<any>(null);

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

  const exportSisuCsvGrades = async () => {
    setSnackPack((prev) => [...prev, loadingMsg]);

    try {
      const params: any = {};
      if (completionLanguage) {
        params.completionLanguage = completionLanguage;
      }
      if (assessmentDate) {
        params.assessmentDate = assessmentDate;
      }
      const data: BlobPart = await gradesService.exportSisuCsv(
        courseId, instanceId, params
      );

      // Create a blob object from the response data
      const blob = new Blob([data], { type: 'text/csv' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      // Set file name.
      link.download = `grades_course_${courseId}_instance_${instanceId}.csv`;
      // Download file automatically to the user's computer.
      link.click();

      setSnackPack((prev) => [...prev, successMsg]);
    } catch (exception) {
      console.log(exception);
      setSnackPack((prev) => [...prev, errorMsg]);
    } finally {
      setAlertOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} transitionDuration={{ exit: 800 }}>
        <DialogTitle >Export final grades to Sisu CSV</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText sx={{ mb: 3, color: 'black' }}>{instructions}</DialogContentText>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                id="select-grading-completion-language"
                select
                label="Completion language"
                defaultValue="en"
                helperText="If not provided, the default will be English."
                onChange={(e) => {
                  setCompletionLanguage(e.target.value);
                }}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.language}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div>
              <TextField
                id="select-grading-assessment-date"
                InputLabelProps={{ shrink: true }}
                type="date"
                label="Assessment Date"
                /* TODO: Fix TS */
                //format="DD-MM-YYYY"
                helperText="If not provided, the default will be course instance ending date."
                onChange={(e) => {
                  setAssessmentDate(e.target.value);
                }}
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pr: 4, pb: 3 }}>
          <Button size='medium' onClick={() => {
            handleClose();
          }}>
            Cancel
          </Button>
          <Button
            id='ag_confirm_file_upload_btn'
            size='medium'
            variant='outlined'
            onClick={() => {
              exportSisuCsvGrades();
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar
        messageInfo={messageInfo}
        setMessageInfo={setMessageInfo}
        open={alertOpen}
        setOpen={setAlertOpen}
      />
    </>
  );
};

SisuExportDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func
};

export default SisuExportDialog;
