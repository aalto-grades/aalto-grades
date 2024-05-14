// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs';
import 'dayjs/locale/en-gb';
import {enqueueSnackbar} from 'notistack';
import {JSX, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import {FinalGradeData, Language, StudentRow} from '@/common/types';
import {useDownloadSisuGradeCsv} from '../../hooks/useApi';
import {sisuLanguageOptions} from '../../utils';

type DownloadOption = 'all' | 'exported' | 'unexported';

const SisuDownloadDialog = ({
  open,
  handleClose,
  handleExited,
  selectedRows,
}: {
  open: boolean;
  handleClose: () => void;
  handleExited: () => void;
  selectedRows: StudentRow[];
}): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};

  const downloadSisuGradeCsv = useDownloadSisuGradeCsv({
    onSuccess: gradeCsv => {
      const blob = new Blob([gradeCsv], {type: 'text/csv'});

      const linkElement = document.createElement('a');
      linkElement.href = URL.createObjectURL(blob);
      linkElement.download = `grades_course_${courseId}.csv`;
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);

      enqueueSnackbar(
        'Final grades downloaded in the Sisu CSV format successfully.',
        {variant: 'success'}
      );
    },
  });

  // state variables handling the assessment date and completion language.
  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [assessmentDate, setAssessmentDate] = useState<Dayjs | null>(dayjs());
  const [completionLanguage, setCompletionLanguage] = useState<
    Language | undefined
  >(undefined);
  const [downloadOption, setDownloadOption] =
    useState<DownloadOption>('unexported');

  const selectedStudents = selectedRows.map(row => ({
    studentNumber: row.user.studentNumber as string,
    grades: row.finalGrades ?? [],
  }));

  const userGradeAlreadyExported = (grades: FinalGradeData[]): boolean =>
    Boolean(grades.find(finalGrade => finalGrade.sisuExportDate !== null));

  const exportedValuesInList = useMemo(() => {
    for (const row of selectedRows) {
      if (userGradeAlreadyExported(row.finalGrades ?? [])) {
        return true;
      }
    }
    return false;
  }, [selectedRows]);

  const handleDownloadSisuGradeCsv = async (): Promise<void> => {
    if (!courseId) return;

    enqueueSnackbar('Fetching Sisu CSV...', {variant: 'info'});

    let studentNumbers: string[] = [];
    switch (downloadOption) {
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
    if (studentNumbers.length === 0) {
      enqueueSnackbar('You must download data for at least one student.', {
        variant: 'warning',
      });
      return;
    }

    await downloadSisuGradeCsv.mutateAsync({
      courseId,
      data: {
        completionLanguage,
        assessmentDate:
          dateOverride && assessmentDate !== null
            ? assessmentDate.toDate()
            : undefined,
        studentNumbers: studentNumbers as [string, ...string[]], // Non-empty array
      },
    });
    if (!exportedValuesInList) handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      transitionDuration={{exit: 800}}
      TransitionProps={{onExited: handleExited}}
      fullWidth
    >
      <DialogTitle>Download final grades as Sisu CSV</DialogTitle>
      <DialogContent sx={{pb: 0}}>
        <DialogContentText sx={{mb: 3, color: 'black'}}>
          Grading date defaults to the latest submission of the student.
        </DialogContentText>
        <TextField
          id="select-grading-completion-language"
          select
          fullWidth
          margin="normal"
          label="Completion language"
          value={completionLanguage ?? 'default'}
          onChange={e => {
            if (e.target.value === 'default') {
              setCompletionLanguage(undefined);
            } else {
              setCompletionLanguage(e.target.value as Language);
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
        <FormControlLabel
          control={
            <Switch
              checked={dateOverride}
              onChange={e => setDateOverride(e.target.checked)}
            />
          }
          label="Override grading date for all students"
        />
        <Collapse in={dateOverride}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="en-gb"
          >
            <DatePicker
              sx={{mt: 2}}
              label="Assessment Date"
              value={assessmentDate}
              onChange={newDate => newDate && setAssessmentDate(newDate)}
            />
          </LocalizationProvider>
        </Collapse>
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
              value={downloadOption}
              onChange={e =>
                setDownloadOption(e.target.value as DownloadOption)
              }
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
            {selectedRows.map(row => (
              <ListItem key={row.user.studentNumber}>
                <ListItemText
                  primary={`Student number: ${row.user.studentNumber}`}
                  secondary={
                    userGradeAlreadyExported(row.finalGrades ?? [])
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
        <Button variant="outlined" onClick={handleClose}>
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
};

export default SisuDownloadDialog;
