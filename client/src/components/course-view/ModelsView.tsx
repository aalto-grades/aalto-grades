// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Archive, Delete, Edit, Unarchive, Warning} from '@mui/icons-material';
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
import {grey} from '@mui/material/colors';
import {enqueueSnackbar} from 'notistack';
import {JSX, useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {
  GradingModelData,
  CourseRoleType,
  StudentRow,
  SystemRole,
} from '@/common/types';
import {GraphStructure} from '@/common/types/graph';
import CreateGradingModelDialog from './CreateGradingModelDialog';
import EditGradingModelDialog from './EditGradingModelDialog';
import {useGetFinalGrades} from '../../hooks/api/finalGrade';
import {
  useDeleteGradingModel,
  useEditGradingModel,
  useGetAllGradingModels,
  useGetCourseParts,
  useGetCourse,
  useGetGrades,
} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {getCourseRole} from '../../utils/utils';
import Graph from '../graph/Graph';

type ParamsType = {courseId: string; modelId?: string; userId?: string};
const ModelsView = (): JSX.Element => {
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId, modelId, userId} = useParams() as ParamsType;
  const navigate = useNavigate();

  const allGradingModels = useGetAllGradingModels(courseId);
  const course = useGetCourse(courseId);
  const finalGrades = useGetFinalGrades(courseId, {
    enabled:
      auth !== null &&
      (auth.role === SystemRole.Admin ||
        (course.data &&
          getCourseRole(course.data, auth) === CourseRoleType.Teacher)),
  });
  const editModel = useEditGradingModel();
  const delModel = useDeleteGradingModel();
  const courseParts = useGetCourseParts(courseId);
  const grades = useGetGrades(courseId);

  const [currentModel, setCurrentModel] = useState<GradingModelData | null>(
    null
  );
  const [currentUserRow, setCurrentUserRow] = useState<StudentRow | null>(null);
  const [loadGraphId, setLoadGraphId] = useState<number>(-1);

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editDialogModel, setEditDialogModel] =
    useState<GradingModelData | null>(null);
  const [graphOpen, setGraphOpen] = useState<boolean>(false);

  // Sort models by archived status
  const models = useMemo(
    () =>
      allGradingModels.data !== undefined
        ? allGradingModels.data.toSorted(
            (m1, m2) => Number(m1.archived) - Number(m2.archived)
          )
        : undefined,
    [allGradingModels.data]
  );

  const modelsWithFinalGrades = useMemo(() => {
    const withFinalGrades = new Set<number>();
    if (finalGrades.data === undefined) return withFinalGrades;
    for (const finalGrade of finalGrades.data) {
      if (finalGrade.gradingModelId !== null)
        withFinalGrades.add(finalGrade.gradingModelId);
    }
    return withFinalGrades;
  }, [finalGrades.data]);

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

  useEffect(() => {
    if (loadGraphId === -1 || models === undefined) return;

    for (const model of models) {
      if (model.id === loadGraphId) {
        setCurrentModel(model);
        setGraphOpen(true);
        setLoadGraphId(-1);
        navigate(`/${courseId}/models/${model.id}`);
      }
    }
  }, [courseId, loadGraphId, models, navigate]);

  const renameCourseParts = useCallback(
    (model: GradingModelData): GradingModelData => {
      if (courseParts.data === undefined) return model;

      for (const node of model.graphStructure.nodes) {
        if (node.type !== 'coursepart') continue;
        const coursePartId = parseInt(node.id.split('-')[1]);

        const nodeCoursePart = courseParts.data.find(
          coursePart => coursePart.id === coursePartId
        );
        if (nodeCoursePart !== undefined)
          model.graphStructure.nodeData[node.id].title = nodeCoursePart.name;
      }
      return model;
    },
    [courseParts.data]
  );

  const loadGraph = useCallback(
    (model: GradingModelData): void => {
      setCurrentModel(renameCourseParts(structuredClone(model))); // To remove references
      setGraphOpen(true);
    },
    [renameCourseParts]
  );

  // Load modelId url param
  useEffect(() => {
    // If modelId is undefined, unload current model
    if (modelId === undefined && currentModel !== null) {
      setCurrentModel(null);
      setGraphOpen(false);
    }

    if (modelId === undefined || models === undefined) return;
    if (currentModel !== null && currentModel.id === parseInt(modelId)) return;

    for (const model of models) {
      if (model.id === parseInt(modelId)) {
        loadGraph(model);
        return;
      }
    }
    enqueueSnackbar(`Couldn't find grading model with id ${modelId}`, {
      variant: 'error',
    });
    navigate(`/${courseId}/models`);
  }, [courseId, currentModel, loadGraph, modelId, models, navigate]);

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
    gradingModelId: number,
    archived: boolean
  ): void => {
    editModel.mutate({
      courseId,
      gradingModelId,
      gradingModel: {archived},
    });
  };
  const handleDelModel = (gradingModelId: number): void => {
    delModel.mutate({courseId, gradingModelId: gradingModelId});
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
      gradingModelId: currentModel.id,
      gradingModel: {
        name: currentModel.name,
        graphStructure: simplifiedGraphStructure,
      },
    });
  };

  if (models === undefined || courseParts.data === undefined)
    return <>Loading</>;

  const getWarning = (model: GradingModelData): string => {
    if (model.hasArchivedCourseParts && model.hasDeletedCourseParts)
      return 'Contains deleted & archived course parts';
    if (model.hasArchivedCourseParts) return 'Contains archived course parts';
    if (model.hasDeletedCourseParts) return 'Contains deleted course parts';
    return '';
  };

  return (
    <>
      <CreateGradingModelDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={id => {
          allGradingModels.refetch();
          setLoadGraphId(id);
        }}
      />

      <EditGradingModelDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        gradingModelId={editDialogModel?.id ?? null}
        name={editDialogModel?.name ?? null}
      />

      <Box sx={{display: 'flex', mb: 1}}>
        {(auth?.role === SystemRole.Admin || isTeacherInCharge) &&
          !graphOpen && (
            <Tooltip title="New grading model" placement="top">
              <Button
                sx={{mt: 1}}
                variant="outlined"
                onClick={() => setCreateDialogOpen(true)}
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

      <Collapse in={!graphOpen}>
        {models.length === 0 ? (
          <Typography textAlign="left" sx={{p: 2}}>
            No models
          </Typography>
        ) : (
          <List sx={{width: 400}} disablePadding>
            {models.map(model => (
              <ListItem
                sx={{backgroundColor: model.archived ? grey[200] : ''}}
                key={`graph-${model.id}-select`}
                disablePadding
                secondaryAction={
                  editRights ? (
                    <>
                      <Tooltip placement="top" title="Rename grading model">
                        <IconButton
                          onClick={() => {
                            setEditDialogModel(model);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        title={
                          model.archived
                            ? 'Unarchive grading model'
                            : 'Archive grading model'
                        }
                      >
                        <IconButton
                          onClick={() =>
                            handleArchiveModel(model.id, !model.archived)
                          }
                        >
                          {model.archived ? <Unarchive /> : <Archive />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip placement="top" title="Delete grading model">
                        {/* The span is necessary because tooltips don't like disabled buttons*/}
                        <span>
                          <IconButton
                            disabled={modelsWithFinalGrades.has(model.id)}
                            edge="end"
                            onClick={() => handleDelModel(model.id)}
                          >
                            <Delete />
                          </IconButton>
                        </span>
                      </Tooltip>
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
                  {(model.hasArchivedCourseParts ||
                    model.hasDeletedCourseParts) && (
                    <ListItemIcon sx={{mr: 6.6}}>
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
          courseParts={courseParts.data}
          userGrades={
            currentUserRow === null ? null : currentUserRow.courseParts
          }
          readOnly={!editRights}
          onSave={onSave}
        />
      )}
    </>
  );
};

export default ModelsView;
