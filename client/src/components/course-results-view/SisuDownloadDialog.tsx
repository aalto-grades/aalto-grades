// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade, GradeOption, Language } from 'aalto-grades-common/types';
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControlLabel, List, ListItem,
  ListItemText, MenuItem, Paper, TextField, Tooltip, Typography
} from '@mui/material';
import { ChangeEvent, JSX, useState } from 'react';
import { Params, useParams } from 'react-router-dom';

import AlertSnackbar from '../alerts/AlertSnackbar';

import { useDownloadSisuGradeCsv, UseDownloadSisuGradeCsvResult } from '../../hooks/useApi';
import useSnackPackAlerts, { SnackPackAlertState } from '../../hooks/useSnackPackAlerts';
import { LanguageOption, State } from '../../types';

// A Dialog component for downloading a Sisu grade CSV.
const instructions: string =
  'Set the completion language and assesment date for the grading, these values'
  + ' are optional. Click download to download the grades.';

// Available completion languages used in Sisu.
export const languageOptions: Array<LanguageOption> = [
  {
    id: Language.Finnish,
    language: 'Finnish'
  },
  {
    id: Language.Swedish,
    language: 'Swedish'
  },
  {
    id: Language.English,
    language: 'English'
  },
  {
    id: Language.Spanish,
    language: 'Spanish'
  },
  {
    id: Language.Japanese,
    language: 'Japanese'
  },
  {
    id: Language.Chinese,
    language: 'Chinese'
  },
  {
    id: Language.Portuguese,
    language: 'Portuguese'
  },
  {
    id: Language.French,
    language: 'French'
  },
  {
    id: Language.German,
    language: 'German'
  },
  {
    id: Language.Russian,
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
  const [override, setOverride]: State<boolean> =
    useState<boolean>(false);

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

  async function handleDownloadSisuGradeCsv(
    param: 'all' | 'exported' | 'unexported'
  ): Promise<void> {
    if (courseId && assessmentModelId) {
      snackPack.push({
        msg: 'Fetching Sisu CSV...',
        severity: 'info'
      });

      let studentNumbers: Array<string> = [];

      switch (param) {
      case 'exported':
        studentNumbers = props.selectedStudents
          .filter((student: FinalGrade) => userGradeAlreadyExported(student.grades))
          .map((student: FinalGrade) => student.studentNumber);
        break;
      case 'unexported':
        studentNumbers = props.selectedStudents
          .filter((student: FinalGrade) => !userGradeAlreadyExported(student.grades))
          .map((student: FinalGrade) => student.studentNumber);
        break;
      case 'all':
        studentNumbers = props.selectedStudents.map(
          (student: FinalGrade) => student.studentNumber);
        break;
      }

      downloadSisuGradeCsv.mutate({
        courseId: courseId,
        assessmentModelId: assessmentModelId,
        params: {
          completionLanguage: completionLanguage,
          assessmentDate: assessmentDate,
          studentNumbers: studentNumbers,
          override: (param === 'exported' || param === 'all')
        }
      });
    }
  }

  function userGradeAlreadyExported(grades: Array<GradeOption>): boolean {
    return Boolean(grades.find((option: GradeOption) => option.exportedToSisu != null));
  }

  function exportedValuesInList(): boolean {
    for (const value of props.selectedStudents) {
      if (userGradeAlreadyExported(value.grades)) {
        return true;
      }
    }
    return false;
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
            <Box sx={{ mb: 1 }}>
              <TextField
                id="select-grading-completion-language"
                select
                label="Completion language"
                defaultValue="default"
                onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
                  if (e.target.value == 'default') {
                    setCompletionLanguage(undefined);
                  } else {
                    setCompletionLanguage(e.target.value);
                  }
                }}
              >
                <MenuItem value="default">
                  Use course language
                </MenuItem>
                {
                  languageOptions.map((option: LanguageOption) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.language}
                    </MenuItem>
                  ))
                }
              </TextField>
            </Box>
            <Box>
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
            </Box>
            {(exportedValuesInList()) && (
              <Box sx={{ ml: 1, my: 2 }}>
                <FormControlLabel control={(
                  <Checkbox
                    id="select-all"
                    size="small"
                    onClick={(): void => setOverride(!override)}
                    checked={override} />
                )} label={(
                  <Typography variant='body2' sx={{ color: 'red' }}>
                    The list includes grades already exported to Sisu.
                    Please check the box if you want to include these previously exported grades.
                  </Typography>
                )
                } />
              </Box>
            )}
          </Box>
          <Typography variant='h6' sx={{ mt: 1 }}>
            Selected students:
          </Typography>
          <Paper sx={{ maxHeight: 200, overflow: 'auto', my: 1 }}>
            <List dense={true}>
              {props.selectedStudents.map((studentGrade: FinalGrade) => (
                <ListItem key={studentGrade.studentNumber}>
                  <ListItemText
                    primary={`Student number: ${studentGrade.studentNumber}`}
                    secondary={userGradeAlreadyExported(studentGrade.grades) ?
                      'User grade has been exported to Sisu already.' : ''}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ pr: 4, pb: 3 }}>
          <Button
            size='small'
            variant='outlined'
            onClick={props.handleClose}
          >
            Cancel
          </Button>
          {(exportedValuesInList() && !override) && (
            <Tooltip
              title='Download CSV with grades that have been exported at least once to Sisu.'
              placement="top"
            >
              <Button
                id='ag_confirm_file_upload_btn_only_exported'
                size='small'
                variant='contained'
                onClick={(): Promise<void> => handleDownloadSisuGradeCsv('exported')}
              >
                Download exported only
              </Button>
            </Tooltip>
          )}
          <Tooltip
            title={(exportedValuesInList() && !override) ?
              'Download CSV with grades that have not been previously exported to Sisu.' :
              'Download CSV with all grades selected.'
            }
            placement="top"
          >
            <Button
              id='ag_confirm_file_upload_btn'
              size='small'
              variant='contained'
              onClick={(): Promise<void> => {
                return handleDownloadSisuGradeCsv(
                  exportedValuesInList() && !override ? 'unexported' : 'all'
                );
              }}
            >
              {(exportedValuesInList() && !override) ? 'Download unexported only' :
                exportedValuesInList() ? 'Download all' : 'Download'
              }
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
      <AlertSnackbar snackPack={snackPack} />
    </>
  );
}
