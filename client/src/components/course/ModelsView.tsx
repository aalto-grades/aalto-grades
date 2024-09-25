// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Collapse, List, Tooltip, Typography} from '@mui/material';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useCallback, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';

import {
  type CoursePartData,
  CourseRoleType,
  type GradingModelData,
  type GraphStructure,
  type StudentRow,
  SystemRole,
} from '@/common/types';
import {batchCalculateCourseParts} from '@/common/util';
import Graph from '@/components/shared/graph/Graph';
import {simplifyNode} from '@/components/shared/graph/graphUtil';
import {
  useDeleteGradingModel,
  useEditGradingModel,
  useGetAllGradingModels,
  useGetCourse,
  useGetCourseParts,
  useGetCourseTasks,
  useGetFinalGrades,
  useGetGrades,
} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {findBestGrade, getCourseRole} from '@/utils';
import CreateGradingModelDialog from './models-view/CreateGradingModelDialog';
import MissingModelButton from './models-view/MissingModelButton';
import ModelButton from './models-view/ModelButton';
import RenameGradingModelDialog from './models-view/RenameGradingModelDialog';

type ParamsType = {courseId: string; modelId?: string; userId?: string};
const ModelsView = (): JSX.Element => {
  const {t} = useTranslation();
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId, modelId, userId} = useParams() as ParamsType;
  const navigate = useNavigate();

  const course = useGetCourse(courseId);
  const allGradingModels = useGetAllGradingModels(courseId);
  const editModel = useEditGradingModel();
  const delModel = useDeleteGradingModel();
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const finalGrades = useGetFinalGrades(courseId, {
    enabled:
      auth !== null &&
      (auth.role === SystemRole.Admin ||
        (course.data &&
          getCourseRole(course.data, auth) === CourseRoleType.Teacher)),
  });
  const grades = useGetGrades(courseId);

  const [currentModel, setCurrentModel] = useState<GradingModelData | null>(
    null
  );
  const [currentUserRow, setCurrentUserRow] = useState<StudentRow | null>(null);
  const [coursePartValues, setCoursePartValues] = useState<{
    [key: string]: number | null;
  } | null>(null);
  const [loadGraphId, setLoadGraphId] = useState<number>(-1);

  const [createDialogOpen, setCreateDialogOpen] = useState<{
    open: boolean;
    coursePart?: CoursePartData;
  }>({open: false});
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editDialogModel, setEditDialogModel] =
    useState<GradingModelData | null>(null);
  const [graphOpen, setGraphOpen] = useState<boolean>(false);

  // Sort models by archived status
  const models = useMemo(
    () =>
      allGradingModels.data === undefined
        ? null
        : [...allGradingModels.data]
            .sort((m1, m2) => Number(m1.archived) - Number(m2.archived))
            .filter(
              // Filter out models from archived course parts
              model =>
                !(model.coursePartId && courseParts.data) ||
                !courseParts.data.some(
                  part => part.id === model.coursePartId && part.archived
                )
            ),
    [allGradingModels.data, courseParts.data]
  );

  const coursePartsWithoutModels = useMemo(
    () =>
      courseParts.data?.filter(
        part =>
          !part.archived &&
          !models?.some(model => model.coursePartId === part.id)
      ) ?? [],
    [courseParts.data, models]
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
    if (loadGraphId === -1) return;

    for (const model of models!) {
      if (model.id === loadGraphId) {
        setCurrentModel(model);
        setGraphOpen(true);
        setLoadGraphId(-1);
        navigate(`/${courseId}/models/${model.id}`);
      }
    }
  }, [courseId, loadGraphId, models, navigate]);

  const renameSources = useCallback(
    (model: GradingModelData): GradingModelData => {
      if (courseTasks.data === undefined || courseParts.data === undefined)
        return model;

      for (const node of model.graphStructure.nodes) {
        if (node.type !== 'source') continue;
        const sourceId = parseInt(node.id.split('-')[1]);

        let sourceName = null;
        if (model.coursePartId !== null) {
          const sourceTask = courseTasks.data.find(
            task => task.id === sourceId
          );
          sourceName = sourceTask?.name;
        } else {
          const sourcePart = courseParts.data.find(
            task => task.id === sourceId
          );
          sourceName = sourcePart?.name;
        }
        if (sourceName)
          model.graphStructure.nodeData[node.id].title = sourceName;
      }
      return model;
    },
    [courseParts.data, courseTasks.data]
  );

  const loadGraph = useCallback(
    (model: GradingModelData): void => {
      setCurrentModel(renameSources(structuredClone(model))); // To remove references
      setGraphOpen(true);
    },
    [renameSources]
  );

  // Load modelId url param
  useEffect(() => {
    if (models === null) return;

    // If modelId is undefined, unload current model
    if (modelId === undefined && currentModel !== null) {
      setCurrentModel(null);
      setGraphOpen(false);
    }

    if (modelId === undefined) return;
    if (currentModel !== null && currentModel.id === parseInt(modelId)) return;

    for (const model of models) {
      if (model.id === parseInt(modelId)) {
        loadGraph(model);
        return;
      }
    }
    enqueueSnackbar(t('course.models.model-not-found', {model: modelId}), {
      variant: 'error',
    });
    navigate(`/${courseId}/models`);
  }, [courseId, currentModel, loadGraph, modelId, models, navigate, t]);

  // Load userId url param
  useEffect(() => {
    if (userId === undefined || grades.data === undefined || models === null)
      return;
    if (currentUserRow !== null && currentUserRow.user.id === parseInt(userId))
      return;

    const userRow = grades.data.find(row => row.user.id === parseInt(userId));
    if (userRow === undefined) {
      enqueueSnackbar(t('course.models.grade-not-found', {user: userId}), {
        variant: 'error',
      });
      navigate(`/${courseId}/models/${modelId}`);
      return;
    }

    setCurrentUserRow(userRow);
    setCoursePartValues(
      batchCalculateCourseParts(models, [
        {
          userId: userRow.user.id,
          courseTasks: userRow.courseTasks
            .filter(task => task.grades.length > 0)
            .map(task => ({
              id: task.courseTaskId,
              grade: findBestGrade(task.grades)!.grade,
            })),
        },
      ])[userRow.user.id]
    );
  }, [
    courseId,
    currentUserRow,
    grades.data,
    modelId,
    models,
    navigate,
    t,
    userId,
  ]);

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
  const handleDelModel = async (gradingModelId: number): Promise<void> => {
    const confirmation = await AsyncConfirmationModal({
      title: t('course.models.delete-model'),
      message: t('course.models.delete-model-message'),
      confirmDelete: true,
    });
    if (confirmation) {
      delModel.mutate({courseId, gradingModelId: gradingModelId});
    }
  };

  const onSave = async (graphStructure: GraphStructure): Promise<void> => {
    if (currentModel === null) throw new Error(t('course.models.save-null'));

    const nodeIds = new Set(graphStructure.nodes.map(node => node.id));
    const simplifiedGraphStructure = {
      // Simplify nodes
      nodes: graphStructure.nodes.map(simplifyNode),
      edges: graphStructure.edges,
      // Remove nodeData for nodes that no longer exist
      nodeData: Object.fromEntries(
        Object.entries(graphStructure.nodeData).filter(([key]) =>
          nodeIds.has(key)
        )
      ),
    };
    await editModel.mutateAsync({
      courseId,
      gradingModelId: currentModel.id,
      gradingModel: {
        name: currentModel.name,
        graphStructure: simplifiedGraphStructure,
      },
    });
  };

  if (
    courseParts.data === undefined ||
    courseTasks.data === undefined ||
    models === null
  )
    return <>{t('general.loading')}</>;

  return (
    <>
      <CreateGradingModelDialog
        open={createDialogOpen.open}
        onClose={() => setCreateDialogOpen({open: false})}
        onSubmit={id => {
          allGradingModels.refetch();
          setLoadGraphId(id);
        }}
        coursePart={createDialogOpen.coursePart}
      />
      <RenameGradingModelDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        gradingModelId={editDialogModel?.id ?? null}
        name={editDialogModel?.name ?? null}
      />

      <Typography width="fit-content" variant="h2">
        {t('general.grading-models')}
      </Typography>
      <Box sx={{display: 'flex', mb: 1}}>
        {(auth?.role === SystemRole.Admin || isTeacherInCharge) &&
          !graphOpen && (
            <Tooltip
              title={t('course.models.create-final-grade-model')}
              placement="top"
            >
              <Button
                sx={{mt: 1}}
                variant="outlined"
                onClick={() => setCreateDialogOpen({open: true})}
              >
                {t('course.models.create-final-grade-model')}
              </Button>
            </Tooltip>
          )}
        {graphOpen && (
          <Button
            sx={{mt: 1}}
            variant="outlined"
            onClick={() => navigate(`/${courseId}/models`)}
          >
            {t('course.models.back')}
          </Button>
        )}
      </Box>

      <Collapse in={!graphOpen}>
        {models.length + coursePartsWithoutModels.length === 0 ? (
          <Typography textAlign="left" sx={{p: 2}}>
            {t('course.models.no-models')}
          </Typography>
        ) : (
          <List sx={{width: 400}} disablePadding>
            {models.map(model => (
              <ModelButton
                key={model.id}
                model={model}
                editRights={editRights}
                modelsWithFinalGrades={modelsWithFinalGrades}
                onEdit={() => {
                  setEditDialogModel(model);
                  setEditDialogOpen(true);
                }}
                onArchive={() => handleArchiveModel(model.id, !model.archived)}
                onDelete={async () => handleDelModel(model.id)}
                onClick={() => {
                  if (userId !== undefined)
                    navigate(`/${courseId}/models/${model.id}/${userId}`);
                  else navigate(`/${courseId}/models/${model.id}`);
                }}
              />
            ))}
            {editRights &&
              coursePartsWithoutModels.map(part => (
                <MissingModelButton
                  key={part.id}
                  part={part}
                  onClick={() =>
                    setCreateDialogOpen({open: true, coursePart: part})
                  }
                />
              ))}
          </List>
        )}
      </Collapse>

      {graphOpen && currentModel !== null && (
        <Graph
          key={currentModel.id} // Reset graph for each model
          initGraph={currentModel.graphStructure}
          sources={
            currentModel.coursePartId
              ? courseTasks.data.filter(
                  task => task.coursePartId === currentModel.coursePartId
                )
              : courseParts.data
          }
          sourceValues={
            currentModel.coursePartId
              ? (currentUserRow?.courseTasks.map(task => ({
                  id: task.courseTaskId,
                  value: findBestGrade(task.grades)?.grade ?? 0,
                })) ?? null)
              : coursePartValues === null
                ? null
                : Object.entries(coursePartValues).map(([id, value]) => ({
                    id: parseInt(id),
                    value: value ?? 0,
                  }))
          }
          readOnly={!editRights}
          onSave={onSave}
          modelHasFinalGrades={modelsWithFinalGrades.has(currentModel.id)}
        />
      )}
    </>
  );
};

export default ModelsView;
