// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import {type JSX, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {GradingModelData} from '@/common/types';
import Graph from '@/components/shared/graph/Graph';
import type {GroupedStudentRow} from '@/context/GradesTableProvider';
import {useTableContext} from '@/context/useTableContext';
import {useGetCourseParts} from '@/hooks/useApi';
import {findBestGrade} from '@/utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  gradingModels: GradingModelData[] | undefined;
  row: GroupedStudentRow | null;
};
const UserGraphDialog = ({
  open,
  onClose,
  gradingModels,
  row,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const {gradeSelectOption} = useTableContext();
  const courseParts = useGetCourseParts(courseId);

  const [selectedModel, setSelectedModel] = useState<GradingModelData | null>(
    null
  );

  useEffect(() => {
    if (gradingModels !== undefined && gradingModels.length > 0)
      setSelectedModel(gradingModels[0]);
  }, [gradingModels]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Final grade preview</DialogTitle>
      <DialogContent>
        {row === null ? (
          <>{t('course.results.data-undefined')}</>
        ) : selectedModel === null || courseParts.data === undefined ? (
          <>{t('general.loading')}</>
        ) : (
          <Graph
            key={selectedModel.id} // Reset graph for each model
            initGraph={selectedModel.graphStructure}
            sources={row.courseTasks.map(rowCourseTask => ({
              id: rowCourseTask.courseTaskId,
              name: rowCourseTask.courseTaskName,
              archived:
                courseParts.data.find(
                  coursePart => coursePart.id === rowCourseTask.courseTaskId // TODO: Fix
                )?.archived ?? false,
            }))}
            sourceValues={row.courseTasks.map(task => ({
              sourceId: task.courseTaskId,
              sourceValue: findBestGrade(task.grades)?.grade ?? 0,
            }))}
            gradeSelectOption={gradeSelectOption}
            readOnly
          />
        )}
      </DialogContent>
      <DialogActions>
        {gradingModels !== undefined && gradingModels.length > 0 && (
          <FormControl size="small">
            <InputLabel id="grading-model-select-label">
              {t('general.grading-model')}
            </InputLabel>
            <Select
              labelId="grading-model-select-label"
              sx={{minWidth: '150px'}}
              value={selectedModel?.id ?? gradingModels[0].id}
              label="Grading model"
              onChange={event => {
                setSelectedModel(
                  gradingModels.find(model => model.id === event.target.value)!
                );
              }}
            >
              {gradingModels.map(model => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button onClick={onClose} variant="contained">
          {t('general.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserGraphDialog;
