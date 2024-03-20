// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import {ChangeEvent, JSX, SyntheticEvent, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {AssessmentModelData} from '@common/types';
import {
  useAddAssessmentModel,
  UseAddAssessmentModelResult,
  useGetAttainments,
} from '../../hooks/useApi';
import {State} from '../../types';
import {NodeData} from '@common/types/graph';

export default function CreateAssessmentModelDialog(props: {
  handleClose: () => void;
  open: boolean;
  onSubmit: (id: number) => void;
  assessmentModels?: Array<AssessmentModelData>;
}): JSX.Element {
  const {courseId}: Params = useParams() as {courseId: string};

  const [name, setName]: State<string> = useState('');

  const attainments = useGetAttainments(courseId);
  const addAssessmentModel: UseAddAssessmentModelResult =
    useAddAssessmentModel();

  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();

    if (attainments.data === undefined || courseId === undefined) return;
    addAssessmentModel.mutate(
      {
        courseId: courseId,
        assessmentModel: {
          name,
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
                (map: {[key: string]: NodeData}, attainment) => {
                  map[`attainment-${attainment.id}`] = {
                    title: attainment.name,
                    settings: {onFailSetting: 'coursefail', minPoints: 0},
                  };
                  return map;
                },
                {}
              ),
            },
          },
        },
      },
      {
        onSuccess: id => {
          props.handleClose();
          props.onSubmit(id);
        },
      }
    );
  };

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
              disabled={addAssessmentModel.isPending}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                setName(event.target.value)
              }
            />
            <Stack spacing={2} direction="row" sx={{mt: 2}}>
              <Button
                size="large"
                variant="outlined"
                onClick={props.handleClose}
                disabled={addAssessmentModel.isPending}
              >
                Cancel
              </Button>
              <Button
                size="large"
                variant="contained"
                type="submit"
                disabled={name.length === 0 || addAssessmentModel.isPending}
              >
                Submit
                {addAssessmentModel.isPending && (
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
