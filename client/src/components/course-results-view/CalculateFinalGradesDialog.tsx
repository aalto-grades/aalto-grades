// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs';
import 'dayjs/locale/en-gb';
import {useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';

import {AssessmentModelData, StudentRow} from '@/common/types';
import {useGetAllAssessmentModels} from '../../hooks/useApi';
import {GradeSelectOption} from '../../utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  selectedRows: StudentRow[];
  gradeSelectOption: GradeSelectOption;
  calculateFinalGrades: (
    selectedRows: StudentRow[],
    modelId: number,
    dateOverride: boolean,
    gradingDate: Date
  ) => Promise<boolean>;
};

const CalculateFinalGradesDialog = ({
  open,
  onClose,
  selectedRows,
  gradeSelectOption,
  calculateFinalGrades,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const allAssessmentModels = useGetAllAssessmentModels(courseId);

  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [gradingDate, setGradingDate] = useState<Dayjs>(dayjs());
  const [selectedModel, setSelectedModel] =
    useState<AssessmentModelData | null>(null);

  // Filter out archived models
  const modelList = useMemo(
    () =>
      allAssessmentModels.data !== undefined
        ? allAssessmentModels.data.filter(model => !model.archived)
        : [],
    [allAssessmentModels.data]
  );

  useEffect(() => {
    if (!open) return;

    let latestDate = new Date(1970, 0, 1);
    for (const row of selectedRows) {
      for (const att of row.attainments) {
        for (const grade of att.grades) {
          if (grade.date.getTime() > latestDate.getTime())
            latestDate = grade.date;
        }
      }
    }
    setGradingDate(dayjs(latestDate));
  }, [open, selectedRows]);

  useEffect(() => {
    if (selectedModel === null && modelList.length > 0)
      setSelectedModel(modelList[0]);
  }, [modelList, selectedModel]);

  const handleSubmit = async (): Promise<void> => {
    if (selectedModel === null) return;
    const success = await calculateFinalGrades(
      selectedRows,
      selectedModel.id,
      dateOverride,
      gradingDate.toDate()
    );
    if (success) onClose();
  };

  const getWarning = (model: AssessmentModelData | null): string => {
    if (model === null) return '';
    if (model.hasArchivedAttainments && model.hasDeletedAttainments)
      return 'Grading model contains deleted & archived attainments';
    if (model.hasArchivedAttainments)
      return 'Grading model contains archived attainments';
    if (model.hasDeletedAttainments)
      return 'Grading model contains deleted attainments';
    return '';
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Calculate final grades</DialogTitle>
      <DialogContent>
        <Typography sx={{mb: 2}}>
          {selectedRows.length === 1
            ? 'Calculating final grade for 1 student'
            : `Calculating final grades for ${selectedRows.length} students`}
        </Typography>
        {gradeSelectOption === 'latest' && (
          <Alert sx={{mb: 2}} severity="info">
            You are using latest grades instead of the best grades to calculate
            the final grades.
          </Alert>
        )}
        <FormControl sx={{display: 'block'}}>
          <InputLabel id="calculateGradesSelect">Grading model</InputLabel>
          <Select
            sx={{width: '100%'}}
            labelId="calculateGradesSelect"
            value={selectedModel?.name ?? ''}
            onChange={e => {
              setSelectedModel(
                modelList.find(model => model.name === e.target.value)!
              );
            }}
            label="Grading model"
          >
            {modelList.map(model => (
              <MenuItem
                key={`calculateGradesSelectModel-${model.id}`}
                value={model.name}
              >
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Collapse
          in={
            selectedModel?.hasDeletedAttainments ||
            selectedModel?.hasArchivedAttainments
          }
        >
          <Alert sx={{mt: 1}} severity="warning">
            {getWarning(selectedModel)}
          </Alert>
        </Collapse>
        <FormControlLabel
          sx={{mt: 1}}
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
              label="Grading date"
              sx={{width: '100%', mt: 2}}
              format="DD.MM.YYYY"
              value={gradingDate}
              onChange={newDate => newDate !== null && setGradingDate(newDate)}
            />
          </LocalizationProvider>
        </Collapse>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculateFinalGradesDialog;
