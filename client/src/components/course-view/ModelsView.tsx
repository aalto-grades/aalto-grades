// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Archive, Delete, Unarchive, Warning} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {JSX, useCallback, useEffect, useMemo, useState} from 'react';
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
  const [graphOpen, setGraphOpen] = useState(false);

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

  useEffect(() => {
    if (loadGraphId === -1 || models.data === undefined) return;

    for (const model of models.data) {
      if (model.id === loadGraphId) {
        setCurrentModel(model);
        setGraphOpen(true);
        setLoadGraphId(-1);
        navigate(`/${courseId}/models/${model.id}`);
      }
    }
  }, [courseId, loadGraphId, models.data, navigate]);

  const renameAttainments = useCallback(
    (model: AssessmentModelData): AssessmentModelData => {
      if (attainments.data === undefined) return model;

      for (const node of model.graphStructure.nodes) {
        if (node.type !== 'attainment') continue;
        const attainmentId = parseInt(node.id.split('-')[1]);

        const attainment = attainments.data.find(
          att => att.id === attainmentId
        );
        if (attainment !== undefined)
          model.graphStructure.nodeData[node.id].title = attainment.name;
      }
      return model;
    },
    [attainments.data]
  );

  const loadGraph = useCallback(
    (model: AssessmentModelData): void => {
      setCurrentModel(renameAttainments(structuredClone(model))); // To remove references
      setGraphOpen(true);
    },
    [renameAttainments]
  );

  // Load modelId url param
  useEffect(() => {
    // If modelId is undefined, unload current model
    if (modelId === undefined && currentModel !== null) {
      setCurrentModel(null);
      setGraphOpen(false);
    }

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

  const handleArchiveModel = (
    assessmentModelId: number,
    archived: boolean
  ): void => {
    editModel.mutate({
      courseId,
      assessmentModelId,
      assessmentModel: {archived},
    });
  };
  const handleDelModel = (assessmentModelId: number): void => {
    delModel.mutate({courseId, assessmentModelId});
  };

  const onSave = async (graphStructure: GraphStructure): Promise<void> => {
    if (currentModel === null) throw new Error('Tried to save null model');

    const simplifiedGraphStructure = structuredClone(graphStructure);
    // Remove unnecessary keys from data.
    for (const node of simplifiedGraphStructure.nodes) {
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
      assessmentModelId: currentModel.id,
      assessmentModel: {
        name: currentModel.name,
        graphStructure: simplifiedGraphStructure,
      },
    });
  };

  if (models.data === undefined || attainments.data === undefined)
    return <>Loading</>;

  const getWarning = (model: AssessmentModelData): string => {
    if (model.hasArchivedAttainments && model.hasDeletedAttainments)
      return 'Contains deleted & archived attainments';
    if (model.hasArchivedAttainments) return 'Contains archived attainments';
    if (model.hasDeletedAttainments) return 'Contains deleted attainments';
    return '';
  };

  return (
    <>
      <Box sx={{display: 'flex', mb: 1}}>
        {(auth?.role === SystemRole.Admin || isTeacherInCharge) &&
          !graphOpen && (
            <Tooltip title="New assessment model" placement="top">
              <Button
                sx={{mt: 1}}
                variant="outlined"
                onClick={() => setCreateViewOpen(true)}
              >
                Create New
              </Button>
            </Tooltip>
          )}
        {graphOpen && (
          <Button
            sx={{mt: 1}}
            variant="outlined"
            onClick={() => navigate(`/${courseId}/models`)}
          >
            Back to models
          </Button>
        )}
      </Box>

      <Box>
        <CreateAssessmentModelDialog
          open={createViewOpen}
          handleClose={(): void => setCreateViewOpen(false)}
          onSubmit={id => {
            models.refetch();
            setLoadGraphId(id);
          }}
        />

        <Collapse in={!graphOpen}>
          {models.data.length === 0 ? (
            <Typography textAlign="left" sx={{p: 2}}>
              No models
            </Typography>
          ) : (
            <List sx={{width: 400}} disablePadding>
              {models.data.map(model => (
                <ListItem
                  key={`graph-${model.id}-select`}
                  disablePadding
                  secondaryAction={
                    editRights ? (
                      <>
                        <IconButton
                          onClick={() =>
                            handleArchiveModel(model.id, !model.archived)
                          }
                        >
                          {model.archived ? <Unarchive /> : <Archive />}
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelModel(model.id)}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    ) : null
                  }
                >
                  <ListItemButton
                    onClick={() => {
                      if (userId !== undefined)
                        navigate(`/${courseId}/models/${model.id}/${userId}`);
                      else navigate(`/${courseId}/models/${model.id}`);
                    }}
                  >
                    <ListItemText primary={model.name} />
                    {(model.hasArchivedAttainments ||
                      model.hasDeletedAttainments) && (
                      <ListItemIcon sx={{mr: 1.6}}>
                        <Tooltip title={getWarning(model)} placement="top">
                          <Warning color="warning" />
                        </Tooltip>
                      </ListItemIcon>
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Collapse>

        {graphOpen && currentModel !== null && (
          <Graph
            initGraph={currentModel.graphStructure}
            attainments={attainments.data}
            userGrades={
              currentUserRow === null ? null : currentUserRow.attainments
            }
            readOnly={!editRights}
            onSave={onSave}
          />
        )}
      </Box>
    </>
  );
};

export default ModelsView;
