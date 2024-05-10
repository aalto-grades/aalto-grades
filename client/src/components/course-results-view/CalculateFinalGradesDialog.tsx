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
  const assessmentModels = useGetAllAssessmentModels(courseId);

  const [dateOverride, setDateOverride] = useState<boolean>(false);
  const [gradingDate, setGradingDate] = useState<Dayjs>(dayjs());
  const [selectedModel, setSelectedModel] =
    useState<AssessmentModelData | null>(null);
  const modelList = useMemo(
    () => assessmentModels.data ?? [],
    [assessmentModels.data]
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
      return 'Assessment model contains deleted & archived attainments';
    if (model.hasArchivedAttainments)
      return 'Assessment model contains archived attainments';
    if (model.hasDeletedAttainments)
      return 'Assessment model contains deleted attainments';
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
        <FormControl disabled fullWidth sx={{mb: 2}}>
          <InputLabel id="select-grade-select-option">
            Grade selection criterion
          </InputLabel>
          <Select
            labelId="select-grade-select-option"
            value={gradeSelectOption}
            label="Grade selection criterion"
          >
            <MenuItem value="best">Select best grade</MenuItem>
            <MenuItem value="latest">Select latest grade</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{display: 'block'}}>
          <InputLabel id="calculateGradesSelect">Assessment model</InputLabel>
          <Select
            sx={{width: '100%'}}
            labelId="calculateGradesSelect"
            value={selectedModel?.name ?? ''}
            onChange={e => {
              setSelectedModel(
                modelList.find(model => model.name === e.target.value)!
              );
            }}
            label="Assessment model"
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
