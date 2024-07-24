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

import {GradingModelData, StudentRow} from '@/common/types';
import {GroupedStudentRow} from '../../context/GradesTableProvider';
import {useGetAllGradingModels} from '../../hooks/useApi';
import {GradeSelectOption} from '../../utils/bestGrade';
import {getErrorTypes} from '../../utils/table';

type PropsType = {
  open: boolean;
  onClose: () => void;
  selectedRows: GroupedStudentRow[];
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
  const allGradingModels = useGetAllGradingModels(courseId);
  // TODO: Auto select the model used in the table view

  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [gradingDate, setGradingDate] = useState<Dayjs>(dayjs());
  const [selectedModel, setSelectedModel] = useState<GradingModelData | null>(
    null
  );

  // Filter out archived models
  const modelList = useMemo(
    () =>
      allGradingModels.data !== undefined
        ? allGradingModels.data.filter(model => !model.archived)
        : [],
    [allGradingModels.data]
  );

  const errors = useMemo(
    () => getErrorTypes(selectedRows, selectedModel?.id ?? 'any'),
    [selectedRows, selectedModel]
  );

  useEffect(() => {
    if (!open) return;

    let latestDate = new Date(1970, 0, 1);
    for (const row of selectedRows) {
      for (const coursePart of row.courseParts) {
        for (const grade of coursePart.grades) {
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

  const getWarning = (model: GradingModelData | null): string => {
    if (model === null) return '';
    if (model.hasArchivedCourseParts && model.hasDeletedCourseParts)
      return 'Grading model contains deleted & archived course parts';
    if (model.hasArchivedCourseParts)
      return 'Grading model contains archived course parts';
    if (model.hasDeletedCourseParts)
      return 'Grading model contains deleted course parts';
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

        {/* Warnings */}
        {gradeSelectOption === 'latest' && (
          <Alert sx={{mb: 2, mt: -1}} severity="info">
            You are using latest grades instead of the best grades to calculate
            the final grades.
          </Alert>
        )}
        <Collapse in={errors.InvalidGrade}>
          <Alert sx={{mb: 2, mt: -1}} severity="warning">
            Some of the selected grades are invalid.
          </Alert>
        </Collapse>
        <Collapse
          in={
            selectedModel?.hasDeletedCourseParts ||
            selectedModel?.hasArchivedCourseParts
          }
        >
          <Alert sx={{mb: 2, mt: -1}} severity="warning">
            {getWarning(selectedModel)}
          </Alert>
        </Collapse>
        <Collapse
          in={errors.InvalidPredictedGrade || errors.OutOfRangePredictedGrade}
        >
          <Alert sx={{mb: 2, mt: -1}} severity="error">
            Some final grades will have invalid values, check if the correct
            grading model is being used
          </Alert>
        </Collapse>

        <FormControl sx={{display: 'block'}}>
          <InputLabel id="calculate-grades-select">Grading model</InputLabel>
          <Select
            labelId="calculate-grades-select"
            sx={{width: '100%'}}
            value={selectedModel?.name ?? ''}
            onChange={e => {
              setSelectedModel(
                modelList.find(model => model.name === e.target.value)!
              );
            }}
            label="Grading model"
          >
            {modelList.map(model => (
              <MenuItem key={model.id} value={model.name}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            errors.InvalidPredictedGrade || errors.OutOfRangePredictedGrade
          }
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalculateFinalGradesDialog;
