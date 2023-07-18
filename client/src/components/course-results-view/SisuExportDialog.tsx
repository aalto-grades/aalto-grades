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
import { useState, useEffect } from 'react';
import { Params, useParams } from 'react-router-dom';

import AlertSnackbar from '../alerts/AlertSnackbar';

import { exportSisuCsv } from '../../services/grades';
import { Message, State } from '../../types';

// A Dialog component for exporting Sisu grades CSV.
const instructions: string =
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
  msg: 'Fetching CSV failed, please try again.'
    + ' Make sure grades have been calculated before exporting.',
  severity: 'error'
};

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

  // state variables handling the alert messages.
  const [snackPack, setSnackPack]: State<Array<Message>> = useState<Array<Message>>([]);
  const [alertOpen, setAlertOpen]: State<boolean> = useState<boolean>(false);
  const [messageInfo, setMessageInfo]: State<Message | null> = useState<Message | null>(null);

  // state variables handling the assessment date and completion language.
  const [assessmentDate, setAssessmentDate]: State<string | null> = useState<string | null>(null);
  const [completionLanguage, setCompletionLanguage]: State<string | null> =
    useState<string | null>(null);

  // useEffect in charge of handling the back-to-back alerts
  // makes the previous disappear before showing the new one
  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev: Array<Message>) => prev.slice(1));
      setAlertOpen(true);
    } else if (snackPack.length && messageInfo && alertOpen) {
      setAlertOpen(false);
    }
  }, [snackPack, messageInfo, alertOpen]);

  async function exportSisuCsvGrades(): Promise<void> {
    setSnackPack((prev: Array<Message>) => [...prev, loadingMsg]);

    try {
      if (courseId && assessmentModelId) {
        const params: {
          completionLanguage?: string,
          assessmentDate?: string,
          studentNumbers: Array<string>
        } = {
          completionLanguage: completionLanguage ?? undefined,
          assessmentDate: assessmentDate ?? undefined,
          studentNumbers: props.selectedStudents.map((student: FinalGrade) => student.studentNumber)
        };

        const data: BlobPart = await exportSisuCsv(
          courseId, assessmentModelId, params
        );

        // Create a blob object from the response data
        const blob: Blob = new Blob([data], { type: 'text/csv' });

        const link: HTMLAnchorElement = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // Set file name.
        link.download = `grades_course_${courseId}_assessment_model_${assessmentModelId}.csv`;
        // Download file automatically to the user's computer.
        link.click();
        URL.revokeObjectURL(link.href);
        link.remove();

        setSnackPack((prev: Array<Message>) => [...prev, successMsg]);
      }
    } catch (error: unknown) {
      console.log(error);
      setSnackPack((prev: Array<Message>) => [...prev, errorMsg]);
    } finally {
      setAlertOpen(false);
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
            onClick={(): void => {
              props.handleClose();
            }}
          >
            Cancel
          </Button>
          <Button
            id='ag_confirm_file_upload_btn'
            size='medium'
            variant='contained'
            onClick={(): void => {
              exportSisuCsvGrades();
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
      <AlertSnackbar
        messageInfo={messageInfo} setMessageInfo={setMessageInfo}
        open={alertOpen} setOpen={setAlertOpen}
      />
    </>
  );
}

SisuExportDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  selectedStudents: PropTypes.array
};
