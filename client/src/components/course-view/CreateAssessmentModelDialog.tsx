// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AssessmentModelData,
  AttainmentData,
  Formula,
  GradeType,
} from '@common/types';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  // FormHelperText,
  // InputLabel,
  // MenuItem,
  // Select,
  // SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import {ChangeEvent, JSX, SyntheticEvent, useState} from 'react';
import {Params, useParams} from 'react-router-dom';
import {QueryObserverResult, UseQueryResult} from '@tanstack/react-query';

import {
  useAddAssessmentModel,
  UseAddAssessmentModelResult,
  useAddAttainment,
  UseAddAttainmentResult,
  useGetAttainments,
  useGetRootAttainment,
} from '../../hooks/useApi';
import {State} from '../../types';

const defaultRoot: AttainmentData = {
  name: 'Root',
  daysValid: 0,
  minRequiredGrade: 1,
  maxGrade: 5,
  formula: Formula.Manual,
  formulaParams: {},
  gradeType: GradeType.Integer,
};

export default function CreateAssessmentModelDialog(props: {
  handleClose: () => void;
  open: boolean;
  onSubmit: () => void;
  assessmentModels?: Array<AssessmentModelData>;
}): JSX.Element {
  const {courseId}: Params = useParams() as {courseId: string};

  const [assessmentModel, setAssessmentModel]: State<number> = useState(0);
  const [name, setName]: State<string> = useState('');

  const attainments = useGetAttainments(courseId);
  const addAssessmentModel: UseAddAssessmentModelResult =
    useAddAssessmentModel();

  const addAttainment: UseAddAttainmentResult = useAddAttainment({
    onSuccess: () => {
      props.handleClose();
      props.onSubmit();
      setName('');
      setAssessmentModel(0);
    },
  });

  const attainment: UseQueryResult<AttainmentData> = useGetRootAttainment(
    Number(courseId),
    assessmentModel,
    'descendants',
    {enabled: false} // Disable this query from automatically running, only if needed.
  );

  async function handleSubmit(event: SyntheticEvent): Promise<void> {
    event.preventDefault();

    if (attainments.data === undefined) return;
    if (courseId) {
      addAssessmentModel.mutate(
        {
          courseId: courseId,
          assessmentModel: {
            name: name,
            graphStructure: {
              nodes: [
                {
                  id: 'final-grade',
                  type: 'grade',
                  position: {x: 500, y: 0},
                  data: {},
                },
                ...attainments.data.map((attainment, index) => ({
                  id: `attainment-${attainment.id}`,
                  type: 'attainment',
                  position: {x: 0, y: 100 * index},
                  data: {},
                })),
              ],
              edges: [],
              nodeData: {
                'final-grade': {title: 'Final Grade'},
                ...attainments.data.reduce(
                  (map: {[key: string]: {title: string}}, attainment) => {
                    map[`attainment-${attainment.id}`] = {
                      title: attainment.name,
                    };
                    return map;
                  },
                  {}
                ),
              },
              nodeValues: {
                'final-grade': {type: 'grade', source: 0, value: 0},
                ...attainments.data.reduce(
                  (map: {[key: string]: {value: number}}, attainment) => {
                    map[`attainment-${attainment.id}`] = {value: 0};
                    return map;
                  },
                  {}
                ),
              },
            },
          },
        },
        {
          onSuccess: async (assessmentModelId: number) => {
            if (courseId) {
              const modelTemplate: AssessmentModelData | undefined =
                props.assessmentModels?.find(
                  (model: AssessmentModelData) => model.id == assessmentModel
                );

              // If template is selected, get attainments and pass them to the new assessment model.
              if (modelTemplate) {
                attainment
                  .refetch()
                  .then(
                    (data: QueryObserverResult<AttainmentData, unknown>) => {
                      addAttainment.mutate({
                        courseId: courseId,
                        assessmentModelId: assessmentModelId,
                        attainment: data.data ?? defaultRoot,
                      });
                    }
                  );
              } else {
                addAttainment.mutate({
                  courseId: courseId,
                  assessmentModelId: assessmentModelId,
                  attainment: defaultRoot,
                });
              }
            }
          },
        }
      );
    }
  }

  return (
    <Dialog open={props.open} transitionDuration={{exit: 800}}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <DialogTitle>Create Assessment Model</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              key="name"
              id="name"
              type="text"
              label="Name*"
              fullWidth
              InputLabelProps={{shrink: true}}
              margin="normal"
              value={name}
              disabled={addAssessmentModel.isPending || addAttainment.isPending}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                setName(event.target.value)
              }
            />
            {/* {props.assessmentModels && (
              <Box sx={{my: 2}}>
                <InputLabel id="assessment-model-select-helper-label">
                  Assessment model
                </InputLabel>
                <Select
                  labelId="assessmentModelSelect"
                  id="assessmentModelSelectId"
                  value={String(assessmentModel)}
                  label="Assessment model"
                  fullWidth
                  disabled={
                    addAssessmentModel.isPending || addAttainment.isPending
                  }
                  onChange={(event: SelectChangeEvent): void => {
                    setAssessmentModel(Number(event.target.value));
                  }}
                >
                  <MenuItem value={0}>use empty</MenuItem>
                  {props.assessmentModels.map((model: AssessmentModelData) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Use existing assessment model as a base.
                </FormHelperText>
              </Box>
            )} */}
            <Stack spacing={2} direction="row" sx={{mt: 2}}>
              <Button
                size="large"
                variant="outlined"
                onClick={props.handleClose}
                disabled={
                  addAssessmentModel.isPending || addAttainment.isPending
                }
              >
                Cancel
              </Button>
              <Button
                size="large"
                variant="contained"
                type="submit"
                disabled={
                  name.length === 0 ||
                  addAssessmentModel.isPending ||
                  addAttainment.isPending
                }
              >
                Submit
                {(addAssessmentModel.isPending || addAttainment.isPending) && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
