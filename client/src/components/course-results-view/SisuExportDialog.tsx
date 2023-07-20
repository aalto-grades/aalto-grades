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
import { useState } from 'react';
import { Params, useParams } from 'react-router-dom';
import { UseQueryResult } from '@tanstack/react-query';

import AlertSnackbar from '../alerts/AlertSnackbar';

import { useExportSisuGradeCsv } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { State } from '../../types';

// A Dialog component for exporting Sisu grades CSV.
const instructions: string =
  'Set the completion language and assesment date for the grading, these values'
  + ' are optional. Click export to export the grades.';

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

export default function SisuExportDialog(props: {
  open: boolean,
  handleClose: () => void,
  selectedStudents: Array<FinalGrade>
}): JSX.Element {
  const { courseId, assessmentModelId }: Params = useParams();

  if (!courseId || !assessmentModelId)
    return (<></>);

  // state variables handling the alert messages.
  const snackPack: SnackPackAlertState = useSnackPackAlerts();

  // state variables handling the assessment date and completion language.
  const [assessmentDate, setAssessmentDate]: State<string | undefined> =
    useState<string | undefined>(undefined);
  const [completionLanguage, setCompletionLanguage]: State<string | undefined> =
    useState<string | undefined>(undefined);

  const exportSisuGradeCsv: UseQueryResult<BlobPart> = useExportSisuGradeCsv(
    courseId, assessmentModelId,
    {
      completionLanguage: completionLanguage,
      assessmentDate: assessmentDate,
      studentNumbers: props.selectedStudents.map((student: FinalGrade) => student.studentNumber)
    },
    { enabled: false }
  );

  async function handleExportSisuGradeCsv(): Promise<void> {
    snackPack.push({
      msg: 'Fetching Sisu CSV...',
      severity: 'info'
    });

    exportSisuGradeCsv.refetch();

    if (!exportSisuGradeCsv.isLoading && exportSisuGradeCsv.data) {
      // Create a blob object from the response data
      const blob: Blob = new Blob([exportSisuGradeCsv.data], { type: 'text/csv' });

      const link: HTMLAnchorElement = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      // Set file name.
      link.download = `grades_course_${courseId}_assessment_model_${assessmentModelId}.csv`;
      // Download file automatically to the user's computer.
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();

      snackPack.push({
        msg: 'Final grades exported to Sisu CSV format succesfully.',
        severity: 'success'
      });
    }
  }

  return (
    <>
      <Dialog open={props.open} transitionDuration={{ exit: 800 }}>
        <DialogTitle >Export final grades to Sisu CSV</DialogTitle>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
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
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
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
            onClick={handleExportSisuGradeCsv}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar snackPack={snackPack} />
    </>
  );
}

SisuExportDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  selectedStudents: PropTypes.array
};
