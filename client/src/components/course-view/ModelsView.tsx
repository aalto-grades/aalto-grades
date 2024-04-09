// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Delete} from '@mui/icons-material';
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
import {enqueueSnackbar} from 'notistack';
import {JSX, useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {AssessmentModelData, StudentRow, SystemRole} from '@common/types';
import {GraphStructure} from '@common/types/graph';
import {
  useDeleteAssessmentModel,
  useEditAssessmentModel,
  useGetAllAssessmentModels,
  useGetAttainments,
  useGetGrades,
} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import Graph from '../graph/Graph';
import CreateAssessmentModelDialog from './CreateAssessmentModelDialog';

type ParamsType = {courseId: string; modelId?: string; userId?: string};
const ModelsView = (): JSX.Element => {
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId, modelId, userId} = useParams() as ParamsType;
  const navigate = useNavigate();

  const models = useGetAllAssessmentModels(courseId);
  const editModel = useEditAssessmentModel();
  const delModel = useDeleteAssessmentModel();
  const attainments = useGetAttainments(courseId);
  const grades = useGetGrades(courseId);

  const [currentModel, setCurrentModel] = useState<AssessmentModelData | null>(
    null
  );
  const [currentUserRow, setCurrentUserRow] = useState<StudentRow | null>(null);
  const [loadGraphId, setLoadGraphId] = useState<number>(-1);

  const [createViewOpen, setCreateViewOpen] = useState(false);
  const [modelsListOpen, setModelsListOpen] = useState(true);
  const [graphOpen, setGraphOpen] = useState(false);

  useEffect(() => {
    if (loadGraphId === -1 || models.data === undefined) return;

    for (const model of models.data) {
      if (model.id === loadGraphId) {
        setCurrentModel(model);
        setGraphOpen(true);
        setLoadGraphId(-1);
      }
    }
  }, [loadGraphId, models.data]);

  const loadGraph = useCallback((model: AssessmentModelData): void => {
    setModelsListOpen(false);
    setCurrentModel(JSON.parse(JSON.stringify(model)) as AssessmentModelData); // To remove references
    setGraphOpen(true);
  }, []);

  // Load modelId url param
  useEffect(() => {
    if (modelId === undefined || models.data === undefined) return;
    if (currentModel !== null && currentModel.id === parseInt(modelId)) return;

    for (const model of models.data) {
      if (model.id === parseInt(modelId)) {
        loadGraph(model);
        return;
      }
    }
    enqueueSnackbar(`Couldn't find assessment model with id ${modelId}`, {
      variant: 'error',
    });
    navigate(`/${courseId}/models`);
  }, [courseId, currentModel, loadGraph, modelId, models.data, navigate]);

  // Load userId url param
  useEffect(() => {
    if (userId === undefined || grades.data === undefined) return;
    if (currentUserRow !== null && currentUserRow.user.id === parseInt(userId))
      return;

    for (const row of grades.data) {
      if (row.user.id === parseInt(userId)) {
        setCurrentUserRow(row);
        return;
      }
    }
    enqueueSnackbar(`Couldn't find user grades for user with id ${userId}`, {
      variant: 'error',
    });
    navigate(`/${courseId}/models/${modelId}`);
  }, [courseId, currentUserRow, grades.data, modelId, navigate, userId]);

  const handleDelModel = (assessmentModelId: number): void => {
    delModel.mutate({courseId, assessmentModelId});
    if (currentModel !== null && assessmentModelId === currentModel.id) {
      setGraphOpen(false);
    }
  };

  const onSave = async (graphStructure: GraphStructure): Promise<void> => {
    if (currentModel === null) throw new Error('Tried to save null model');

    // Remove unnecessary keys from data.
    for (const node of graphStructure.nodes) {
      delete node.dragging;
      delete node.selected;
      delete node.positionAbsolute;
      delete node.width;
      delete node.height;
      // This is enough accuracy.
      node.position.x = Math.round(node.position.x);
      node.position.y = Math.round(node.position.y);
    }
    await editModel.mutateAsync({
      courseId,
      assessmentModelId: currentModel.id as number,
      assessmentModel: {
        name: currentModel.name,
        graphStructure,
      },
    });
  };

  if (models.data === undefined || attainments.data === undefined)
    return <>Loading</>;

  return (
    <Box sx={{border: '1px solid'}}>
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
                  onClick={() => {
                    if (currentModel !== null && model.id === currentModel.id) {
                      setModelsListOpen(false);
                      return;
                    }
                    if (userId !== undefined)
                      navigate(`/${courseId}/models/${model.id}/${userId}`);
                    else navigate(`/${courseId}/models/${model.id}`);
                  }}
                >
                  <ListItemText primary={model.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Collapse>

      {graphOpen && currentModel !== null && (
        <>
          <Divider sx={{my: 1}} />
          <Graph
            initGraph={currentModel.graphStructure}
            attainments={attainments.data}
            userGrades={
              currentUserRow === null ? null : currentUserRow.attainments
            }
            onSave={onSave}
          />
        </>
      )}
    </Box>
  );
};

export default ModelsView;
