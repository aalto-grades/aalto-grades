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
  gradingModels: GradingModelData[] | null;
  coursePartValues: {[key: number]: {[key: string]: number | null}};

  data: {
    row: GroupedStudentRow;
    // If gradingModel is set, we are viewing a course part model
    gradingModel: GradingModelData | null;
  } | null;
};
const UserGraphDialog = ({
  open,
  onClose,
  gradingModels,
  coursePartValues,
  data,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);

  const [selectedModel, setSelectedModel] = useState<GradingModelData | null>(
    null
  );

  // Update selected model on data / gradingModels change
  const [oldModels, setOldModels] = useState<typeof gradingModels>(null);
  const [oldData, setOldData] = useState<typeof data>(null);
  if (gradingModels !== oldModels || data !== oldData) {
    setOldModels(gradingModels);
    setOldData(data);

    if (data?.gradingModel) {
      setSelectedModel(data.gradingModel);
    } else if (gradingModels !== null && gradingModels.length > 0)
      setSelectedModel(gradingModels[0]);
  }

  // Set sources & sourceValues
  let sources: GraphSource[] = [];
  let sourceValues: GraphSourceValue[] = [];
  if (
    selectedModel !== null &&
    courseParts.data !== undefined &&
    courseTasks.data !== undefined &&
    data !== null
  ) {
    if (selectedModel.coursePartId === null) {
      // Final grade model
      sources = courseParts.data.map(part => ({
        id: part.id,
        name: part.name,
        archived: part.archived,
      }));
      sourceValues = Object.entries(coursePartValues[data.row.user.id]).map(
        ([id, value]) => ({id: parseInt(id), value: value ?? 0})
      );
    } else {
      // Course part model
      sources = courseTasks.data.filter(
        task => task.coursePartId === selectedModel.coursePartId
      );
      sourceValues = data.row.courseTasks.map(task => ({
        id: task.courseTaskId,
        value: findBestGrade(task.grades)?.grade ?? 0,
      }));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>
        {data?.gradingModel
          ? t('course.results.final-grade-preview')
          : t('course.results.course-part-value-preview')}
      </DialogTitle>
      <DialogContent>
        {data === null ? (
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
        {gradingModels !== null &&
          gradingModels.length > 0 &&
          !data?.gradingModel && (
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
                    gradingModels.find(
                      model => model.id === event.target.value
                    )!
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
