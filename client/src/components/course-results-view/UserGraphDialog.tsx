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
import {JSX, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {AssessmentModelData} from '@/common/types';
import {GroupedStudentRow} from '../../context/GradesTableProvider';
import {useTableContext} from '../../context/useTableContext';
import {useGetAttainments} from '../../hooks/useApi';
import Graph from '../graph/Graph';

type PropsType = {
  open: boolean;
  onClose: () => void;
  assessmentModels: AssessmentModelData[] | undefined;
  row: GroupedStudentRow | null;
};
const UserGraphDialog = ({
  open,
  onClose,
  assessmentModels,
  row,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const {gradeSelectOption} = useTableContext();
  const attainments = useGetAttainments(courseId);

  const [selectedModel, setSelectedModel] =
    useState<AssessmentModelData | null>(null);

  useEffect(() => {
    if (assessmentModels !== undefined && assessmentModels.length > 0)
      setSelectedModel(assessmentModels[0]);
  }, [assessmentModels]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Graph</DialogTitle>
      <DialogContent>
        {row === null ? (
          <>Data is undefined</>
        ) : selectedModel === null || attainments.data === undefined ? (
          <>Loading</>
        ) : (
          <Graph
            initGraph={selectedModel.graphStructure}
            attainments={row.attainments.map(rowAtt => ({
              id: rowAtt.attainmentId,
              name: rowAtt.attainmentName,
              archived:
                attainments.data.find(att => att.id === rowAtt.attainmentId)
                  ?.archived ?? false,
            }))}
            userGrades={row.attainments}
            gradeSelectOption={gradeSelectOption}
            readOnly
          />
        )}
      </DialogContent>
      <DialogActions>
        {assessmentModels !== undefined && assessmentModels.length > 0 && (
          <FormControl size="small">
            <InputLabel id="assessment-model-select-label">
              Grading model
            </InputLabel>
            <Select
              sx={{minWidth: '150px'}}
              labelId="assessment-model-select-label"
              value={selectedModel?.id ?? assessmentModels[0].id}
              label="Grading model"
              onChange={event => {
                setSelectedModel(
                  assessmentModels.find(
                    model => model.id === event.target.value
                  )!
                );
              }}
            >
              {assessmentModels.map(model => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserGraphDialog;
