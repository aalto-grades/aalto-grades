// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGradeData, StudentRow} from '@common/types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useDownloadSisuGradeCsv} from '../../hooks/useApi';
import {State} from '../../types';
import {sisuLanguageOptions} from '../../utils';

// A Dialog component for downloading a Sisu grade CSV.
const instructions: string =
  'Set the completion language and assessment date for the grading, these values' +
  ' are optional. Click download to download the grades.';

export default function SisuDownloadDialog(props: {
  open: boolean;
  handleClose: () => void;
  handleExited: () => void;
  selectedRows: StudentRow[];
}): JSX.Element {
  const {courseId} = useParams() as {courseId: string};

  const selectedStudents = props.selectedRows.map((s: StudentRow) => ({
    studentNumber: s.user.studentNumber as string,
    grades: s.finalGrades ?? [],
  }));

  // state variables handling the assessment date and completion language.
  const [assessmentDate, setAssessmentDate]: State<string | undefined> =
    useState<string | undefined>(undefined);
  const [completionLanguage, setCompletionLanguage]: State<string | undefined> =
    useState<string | undefined>(undefined);
  const [override, setOverride]: State<string> = useState<string>('all');

  const downloadSisuGradeCsv = useDownloadSisuGradeCsv({
    onSuccess: (gradeCsv: BlobPart) => {
      const blob: Blob = new Blob([gradeCsv], {type: 'text/csv'});

      const linkElement: HTMLAnchorElement = document.createElement('a');
      linkElement.href = URL.createObjectURL(blob);
      linkElement.download = `grades_course_${courseId}.csv`;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);

      enqueueSnackbar(
        'Final grades downloaded in the Sisu CSV format succesfully.',
        {
          variant: 'success',
        }
      );
    },
  });

  const userGradeAlreadyExported = (grades: FinalGradeData[]): boolean =>
    Boolean(
      grades?.find(
        option =>
          // TODO: Null check should be unnecessary
          option.sisuExportDate !== undefined && option.sisuExportDate !== null
      )
    );

  const exportedValuesInList = useMemo(() => {
    for (const value of props.selectedRows) {
      if (userGradeAlreadyExported(value.finalGrades ?? [])) {
        return true;
      }
    }
    return false;
  }, [props.selectedRows]);

  async function handleDownloadSisuGradeCsv(): Promise<void> {
    if (!courseId) return;

    enqueueSnackbar('Fetching Sisu CSV...', {variant: 'info'});

    let studentNumbers: string[] = [];

    switch (override) {
      case 'exported':
        studentNumbers = selectedStudents
          .filter(student => userGradeAlreadyExported(student.grades))
          .map(student => student.studentNumber);
        break;
      case 'unexported':
        studentNumbers = selectedStudents
          .filter(student => !userGradeAlreadyExported(student.grades))
          .map(student => student.studentNumber);
        break;
      case 'all':
        studentNumbers = selectedStudents.map(student => student.studentNumber);
        break;
    }

    await downloadSisuGradeCsv.mutateAsync({
      courseId: courseId,
      completionLanguage: completionLanguage,
      assessmentDate: assessmentDate,
      studentNumbers: studentNumbers,
      override: override === 'exported' || override === 'all',
    });
    if (!exportedValuesInList) props.handleClose();
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      transitionDuration={{exit: 800}}
      TransitionProps={{onExited: props.handleExited}}
      fullWidth
    >
      <DialogTitle>Download final grades as Sisu CSV</DialogTitle>
      <DialogContent sx={{pb: 0}}>
        <DialogContentText sx={{mb: 3, color: 'black'}}>
          {instructions}
        </DialogContentText>
        <TextField
          id="select-grading-completion-language"
          select
          fullWidth
          margin="normal"
          label="Completion language"
          defaultValue="default"
          onChange={e => {
            if (e.target.value === 'default') {
              setCompletionLanguage(undefined);
            } else {
              setCompletionLanguage(e.target.value);
            }
          }}
        >
          <MenuItem value="default">Use course language</MenuItem>
          {sisuLanguageOptions.map(option => (
            <MenuItem key={option.id} value={option.id}>
              {option.language}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="select-grading-assessment-date"
          InputLabelProps={{shrink: true}}
          type="date"
          fullWidth
          margin="normal"
          label="Assessment Date"
          helperText="If not provided, the default will be course instance ending date."
          onChange={e => setAssessmentDate(e.target.value)}
        />
        {exportedValuesInList && (
          <Box sx={{my: 2}}>
            <Typography variant="body2" sx={{color: 'red'}}>
              The list of students includes students who have already been
              included in a Sisu CSV previously. Please select a download option
              from the drop-down menu.
            </Typography>
            <Typography variant="body2" sx={{mt: 1, color: 'red'}}>
              This dialog will NOT close after downloading a CSV file. You may
              download multiple CSV files with different options
            </Typography>
            <TextField
              id="export-option"
              select
              fullWidth
              defaultValue="all"
              onChange={e => setOverride(e.target.value)}
            >
              <MenuItem value="all">
                Download all selected grades in a single CSV
              </MenuItem>
              <MenuItem value="unexported">
                Only download unexported grades
              </MenuItem>
              <MenuItem value="exported">
                Only download previously exported grades
              </MenuItem>
            </TextField>
          </Box>
        )}
        <Typography variant="h6" sx={{mt: 1}}>
          Selected students:
        </Typography>
        <Paper sx={{maxHeight: 200, overflow: 'auto', my: 1}}>
          <List dense>
            {props.selectedRows.map(selectedRow => (
              <ListItem key={selectedRow.user.studentNumber}>
                <ListItemText
                  primary={`Student number: ${selectedRow.user.studentNumber}`}
                  secondary={
                    userGradeAlreadyExported(selectedRow.finalGrades ?? [])
                      ? 'User grade has been exported to Sisu already.'
                      : ''
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={props.handleClose}>
          Cancel
        </Button>
        <Button
          id="ag_confirm_file_upload_btn"
          variant="contained"
          onClick={handleDownloadSisuGradeCsv}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
