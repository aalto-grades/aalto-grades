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
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {
  GradingModelData,
  GraphSource,
  GraphSourceValue,
} from '@/common/types';
import Graph from '@/components/shared/graph/Graph';
import type {GroupedStudentRow} from '@/context/GradesTableProvider';
import {useGetCourseParts, useGetCourseTasks} from '@/hooks/useApi';
import {findBestGrade} from '@/utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  gradingModels: GradingModelData[] | undefined;
  coursePartValues: {[key: number]: {[key: string]: number | null}};

  row: GroupedStudentRow | null;
};
const UserGraphDialog = ({
  open,
  onClose,
  gradingModels,
  coursePartValues,
  row,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);

  const [selectedModel, setSelectedModel] = useState<GradingModelData | null>(
    null
  );

  const [oldModels, setOldModels] = useState<typeof gradingModels>(undefined);
  if (gradingModels !== oldModels) {
    setOldModels(gradingModels);

    if (gradingModels !== undefined && gradingModels.length > 0)
      setSelectedModel(gradingModels[0]);
  }

  let sources: GraphSource[] = [];
  let sourceValues: GraphSourceValue[] = [];
  if (
    selectedModel !== null &&
    courseParts.data !== undefined &&
    courseTasks.data !== undefined &&
    row !== null
  ) {
    if (selectedModel.coursePartId === null) {
      // Final grade model
      sources = courseParts.data.map(part => ({
        id: part.id,
        name: part.name,
        archived: part.archived,
      }));
      sourceValues = Object.entries(coursePartValues[row.user.id]).map(
        ([id, value]) => ({id: parseInt(id), value: value ?? 0})
      );
    } else {
      // Course part model
      sources = courseTasks.data.filter(
        task => task.coursePartId === selectedModel.coursePartId
      );
      sourceValues = row.courseTasks.map(task => ({
        id: task.courseTaskId,
        value: findBestGrade(task.grades)?.grade ?? 0,
      }));
    }
  }

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
            sources={sources}
            sourceValues={sourceValues}
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
