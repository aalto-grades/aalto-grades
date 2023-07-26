// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade } from 'aalto-grades-common/types';
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, List, ListItem,
  ListItemText, MenuItem, Paper, TextField, Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { ChangeEvent, useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import AlertSnackbar from '../alerts/AlertSnackbar';

import { useDownloadSisuGradeCsv, UseDownloadSisuGradeCsvResult } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { State } from '../../types';

// A Dialog component for downloading a Sisu grade CSV.
const instructions: string =
  'Set the completion language and assesment date for the grading, these values'
  + ' are optional. Click download to download the grades.';

interface LanguageOption {
  id: string,
  language: string
}

// Available completion languages used in Sisu.
const languageOptions: Array<LanguageOption> = [
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

export default function SisuDownloadDialog(props: {
  open: boolean,
  handleClose: () => void,
  selectedStudents: Array<FinalGrade>
}): JSX.Element {
  const { courseId, assessmentModelId }: Params =
    useParams() as { courseId: string, assessmentModelId: string };

  // state variables handling the alert messages.
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  // state variables handling the assessment date and completion language.
  const [assessmentDate, setAssessmentDate]: State<string | undefined> =
    useState<string | undefined>(undefined);
  const [completionLanguage, setCompletionLanguage]: State<string | undefined> =
    useState<string | undefined>(undefined);

  const downloadSisuGradeCsv: UseDownloadSisuGradeCsvResult = useDownloadSisuGradeCsv({
    onSuccess: (gradeCsv: BlobPart) => {
      // Create a blob object from the response data
      const blob: Blob = new Blob([gradeCsv], { type: 'text/csv' });

      const link: HTMLAnchorElement = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      // Set file name.
      link.download = `grades_course_${courseId}_assessment_model_${assessmentModelId}.csv`;
      // Download file automatically to the user's computer.
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();

      snackPack.push({
        msg: 'Final grades downloaded in the Sisu CSV format succesfully.',
        severity: 'success'
      });
    }
  });

  async function handleDownloadSisuGradeCsv(): Promise<void> {
    if (courseId && assessmentModelId) {
      snackPack.push({
        msg: 'Fetching Sisu CSV...',
        severity: 'info'
      });

      downloadSisuGradeCsv.mutate({
        courseId: courseId,
        assessmentModelId: assessmentModelId,
        params: {
          completionLanguage: completionLanguage,
          assessmentDate: assessmentDate,
          studentNumbers: props.selectedStudents.map((student: FinalGrade) => student.studentNumber)
        }
      });
    }
  }

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle >Download final grades as Sisu CSV</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText sx={{ mb: 3, color: 'black' }}>
            {instructions}
          </DialogContentText>
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
                onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
                  setCompletionLanguage(e.target.value);
                }}
              >
                {
                  languageOptions.map((option: LanguageOption) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.language}
                    </MenuItem>
                  ))
                }
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
                onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
                  setAssessmentDate(e.target.value);
                }}
              />
            </div>
          </Box>
          <Typography variant='h6' sx={{ mt: 1 }}>
            Selected students:
          </Typography>
          <Paper sx={{ maxHeight: 200, overflow: 'auto', my: 1 }}>
            <List dense={true}>
              { props.selectedStudents.map((studentGrade: FinalGrade) => (
                <ListItem key={studentGrade.studentNumber}>
                  <ListItemText
                    primary={`Student number: ${studentGrade.studentNumber}`}
                  />
                </ListItem>
              )) }
            </List>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ pr: 4, pb: 3 }}>
          <Button
            size='medium'
            variant='outlined'
            onClick={props.handleClose}
          >
            Cancel
          </Button>
          <Button
            id='ag_confirm_file_upload_btn'
            size='medium'
            variant='contained'
            onClick={handleDownloadSisuGradeCsv}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar snackPack={snackPack} />
    </>
  );
}

SisuDownloadDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  selectedStudents: PropTypes.array
};
