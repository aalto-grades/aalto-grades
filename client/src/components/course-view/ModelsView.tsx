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
import {JSX, useEffect, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {
  useDeleteAssessmentModel,
  useEditAssessmentModel,
  useGetAllAssessmentModels,
} from '../../hooks/useApi';
import {GraphStructure} from '@common/types/graph';
import Graph from '../graph/Graph';
import {AssessmentModelData, SystemRole} from '@common/types';
import useAuth from '../../hooks/useAuth';
import CreateAssessmentModelDialog from './CreateAssessmentModelDialog';
import {Delete} from '@mui/icons-material';

export default function ModelsView(): JSX.Element {
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId}: Params = useParams() as {courseId: string};
  const models = useGetAllAssessmentModels(courseId);
  const editModel = useEditAssessmentModel();
  const delModel = useDeleteAssessmentModel();

  const [currentModel, setCurrentModel] = useState<AssessmentModelData>(
    {} as AssessmentModelData
  );
  const [loadGraphId, setLoadGraphId] = useState<number>(-1);

  const [createViewOpen, setCreateViewOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [modelsListOpen, setModelsListOpen] = useState(true);

  useEffect(() => {
    if (loadGraphId === -1 || models.data === undefined) return;
    for (const model of models.data) {
      if (model.id === loadGraphId) {
        setCurrentModel(model);
        setLoadGraphId(-1);
      }
    }
  }, [loadGraphId, models.data]);

  if (models.data === undefined) return <></>;

  const loadGraph = (model: AssessmentModelData): void => {
    setModelsListOpen(false);
    setCurrentModel(model); //JSON parse?
    setModelOpen(true);
  };

  const handleDelModel = (assessmentModelId: number): void => {
    delModel.mutate({courseId, assessmentModelId});
    if (assessmentModelId === currentModel.id) {
      setModelOpen(false);
    }
  };

  const onSave = (graphStructure: GraphStructure): void => {
    editModel.mutate({
      courseId,
      assessmentModelId: currentModel.id as number,
      assessmentModel: {
        name: currentModel.name,
        graphStructure,
      },
    });
  };

  return (
    <Box sx={{border: '1px solid', width: '100%'}}>
      {(auth?.role === SystemRole.Admin || isTeacherInCharge) && (
        <Tooltip sx={{ml: 2}} title="New assessment model" placement="top">
          <Button
            sx={{mt: 1}}
            variant="outlined"
            onClick={(): void => setCreateViewOpen(true)}
          >
            Create New
          </Button>
        </Tooltip>
      )}
      <CreateAssessmentModelDialog
        open={createViewOpen}
        handleClose={(): void => setCreateViewOpen(false)}
        onSubmit={id => {
          models.refetch();
          setModelsListOpen(false);
          setLoadGraphId(id);
        }}
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
                <ListItemButton onClick={() => loadGraph(model)}>
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
          <Graph
            initGraph={currentModel.graphStructure as GraphStructure}
            onSave={onSave}
          />
        </>
      )}
    </Box>
  );
}
