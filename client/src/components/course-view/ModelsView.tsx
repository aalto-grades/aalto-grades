// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import {JSX, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {
  useDeleteAssessmentModel,
  useEditAssessmentModel,
  useGetAllAssessmentModels,
} from '../../hooks/useApi';
import {GraphStructure} from '@common/types/graph';
import Graph from '../graph/Graph';
import {SystemRole} from '@common/types';
import useAuth from '../../hooks/useAuth';
import CreateAssessmentModelDialog from './CreateAssessmentModelDialog';
import {Delete} from '@mui/icons-material';

export default function ModelsView(): JSX.Element {
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId}: Params = useParams() as {courseId: string};
  const models = useGetAllAssessmentModels(courseId);
  const editModel = useEditAssessmentModel();
  const delModel = useDeleteAssessmentModel();
  const [initGraph, setInitGraph] = useState<GraphStructure>(
    {} as GraphStructure
  );
  const [initGraphId, setInitGraphId] = useState<number>(-1);
  const [createAssessmentModelOpen, setCreateAssessmentModelOpen] =
    useState(false);

  const [modelOpen, setModelOpen] = useState(false);
  const [modelsListOpen, setModelsListOpen] = useState(true);

  if (models.data === undefined) return <></>;

  const loadGraph = (id: number, graphStructure: GraphStructure): void => {
    setModelsListOpen(false);
    setInitGraphId(id);
    setInitGraph(JSON.parse(JSON.stringify(graphStructure)));
    setModelOpen(true);
  };

  const handleDelModel = (assessmentModelId: number): void => {
    delModel.mutate({courseId, assessmentModelId});
    if (assessmentModelId === initGraphId) {
      setModelOpen(false);
    }
  };

  const onSave = (graphStructure: GraphStructure): void => {
    let name = '';
    for (const item of models.data) {
      if (item.id === initGraphId) name = item.name;
    }
    editModel.mutate({
      courseId,
      assessmentModelId: initGraphId,
      assessmentModel: {
        name,
        graphStructure,
      },
    });
  };

  return (
    <Box sx={{border: '1px solid', width: '100%'}}>
      {(auth?.role === SystemRole.Admin || isTeacherInCharge) && (
        <Tooltip sx={{ml: 2}} title="New assessment model" placement="right">
          <Button
            sx={{mt: 1}}
            // size="small"
            variant="outlined"
            onClick={(): void => setCreateAssessmentModelOpen(true)}
          >
            Create New
          </Button>
        </Tooltip>
      )}
      <CreateAssessmentModelDialog
        open={createAssessmentModelOpen}
        handleClose={(): void => setCreateAssessmentModelOpen(false)}
        onSubmit={models.refetch}
        assessmentModels={models.data}
      />

      <Button
        sx={{ml: 1, mt: 1}}
        variant="outlined"
        onClick={() => setModelsListOpen(open => !open)}
      >
        {modelsListOpen ? 'Hide Models' : 'Show Models'}
      </Button>

      <Collapse in={modelsListOpen}>
        {models.data.length === 0 ? (
          <Typography textAlign="left" sx={{p: 2}}>
            No models
          </Typography>
        ) : (
          <List sx={{width: 300}} disablePadding>
            {models.data.map(model => (
              <ListItem
                key={`graph-${model.id}-select`}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDelModel(model.id as number)}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() =>
                    loadGraph(
                      model.id as number,
                      model.graphStructure as GraphStructure
                    )
                  }
                >
                  <ListItemText primary={model.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Collapse>

      {modelOpen && (
        <>
          <Divider sx={{my: 1}} />
          <Graph initGraph={initGraph} onSave={onSave} />
        </>
      )}
    </Box>
  );
}
