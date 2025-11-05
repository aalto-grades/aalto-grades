// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {CheckCircle, Inventory, Warning} from '@mui/icons-material';
import {Box, Button, Collapse, Tooltip, Typography} from '@mui/material';
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
  SystemRole,
} from '@/common/types';
import {batchCalculateCourseParts} from '@/common/util';
import ListEntries from '@/components/shared/ListEntries';
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
import {findBestGrade, getCoursePartExpiryDate, getCourseRole} from '@/utils';
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
      auth !== null
      && (auth.role === SystemRole.Admin
        || (course.data
          && getCourseRole(course.data, auth) === CourseRoleType.Teacher)),
  });
  const grades = useGetGrades(courseId);

  const [createDialogOpen, setCreateDialogOpen] = useState<{
    open: boolean;
    coursePart?: CoursePartData;
  }>({open: false});
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editDialogModel, setEditDialogModel] =
    useState<GradingModelData | null>(null);

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
                !(model.coursePartId && courseParts.data)
                || !courseParts.data.some(
                  part => part.id === model.coursePartId && part.archived
                )
            ),
    [allGradingModels.data, courseParts.data]
  );

  const coursePartsWithoutModels = useMemo(
    () =>
      courseParts.data?.filter(
        part =>
          !part.archived
          && !models?.some(model => model.coursePartId === part.id)
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

  // Derive currentModel from modelId URL param
  const currentModel = useMemo(() => {
    if (modelId === undefined || models === null) return null;

    const model = models.find(m => m.id === parseInt(modelId));
    if (!model) return null;

    return renameSources(structuredClone(model));
  }, [modelId, models, renameSources]);

  // Derive graphOpen from whether we have a valid currentModel
  const graphOpen = currentModel !== null;

  // Derive currentUserRow from userId URL param
  const currentUserRow = useMemo(() => {
    if (userId === undefined || grades.data === undefined) return null;
    return grades.data.find(row => row.user.id === parseInt(userId)) ?? null;
  }, [userId, grades.data]);

  // Derive coursePartValues from currentUserRow
  const coursePartValues = useMemo(() => {
    if (currentUserRow === null || models === null) return null;

    return batchCalculateCourseParts(models, [
      {
        userId: currentUserRow.user.id,
        courseTasks: currentUserRow.courseTasks
          .filter(task => task.grades.length > 0)
          .map(task => ({
            id: task.courseTaskId,
            grade: findBestGrade(
              task.grades,
              getCoursePartExpiryDate(
                courseParts.data,
                courseTasks.data,
                task.courseTaskId
              )
            )!.grade,
          })),
      },
    ])[currentUserRow.user.id];
  }, [currentUserRow, models, courseParts.data, courseTasks.data]);

  // Handle invalid modelId
  useEffect(() => {
    if (modelId === undefined || models === null) return;

    const modelExists = models.some(m => m.id === parseInt(modelId));
    if (!modelExists) {
      enqueueSnackbar(t('course.models.model-not-found', {model: modelId}), {
        variant: 'error',
      });
      navigate(`/${courseId}/models`);
    }
  }, [courseId, modelId, models, navigate, t]);

  // Handle invalid userId
  useEffect(() => {
    if (userId === undefined || grades.data === undefined) return;

    const userExists = grades.data.some(row => row.user.id === parseInt(userId));
    if (!userExists) {
      enqueueSnackbar(t('course.models.grade-not-found', {user: userId}), {
        variant: 'error',
      });
      navigate(`/${courseId}/models/${modelId}`);
    }
  }, [courseId, userId, grades.data, modelId, navigate, t]);

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

  const getModelButton = (model: GradingModelData): JSX.Element => {
    return (
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
    );
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
    courseParts.data === undefined
    || courseTasks.data === undefined
    || models === null
  )
    return <>{t('general.loading')}</>;

  return (
    <>
      <CreateGradingModelDialog
        open={createDialogOpen.open}
        onClose={() => setCreateDialogOpen({open: false})}
        onSubmit={async (id) => {
          await allGradingModels.refetch();
          navigate(`/${courseId}/models/${id}`);
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
        {(auth?.role === SystemRole.Admin || isTeacherInCharge)
          && !graphOpen && (
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
            onClick={async () => navigate(`/${courseId}/models`)}
          >
            {t('course.models.back')}
          </Button>
        )}
      </Box>

      <Collapse in={!graphOpen}>
        {models.length + coursePartsWithoutModels.length === 0
          ? (
              <Typography textAlign="left" sx={{p: 2}}>
                {t('course.models.no-models')}
              </Typography>
            )
          : (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  gap: 2,
                }}
              >
                <Collapse in={models.find(mod => !mod.archived) !== undefined}>
                  <ListEntries
                    label={t('course.models.active-models')}
                    icon={<CheckCircle />}
                    color="success"
                  >
                    {models
                      .filter(mod => !mod.archived)
                      .map(model => getModelButton(model))}
                  </ListEntries>
                </Collapse>
                <Collapse in={models.find(mod => mod.archived) !== undefined}>
                  <ListEntries
                    label={t('course.models.archived-models')}
                    icon={<Inventory />}
                  >
                    {models
                      .filter(mod => mod.archived)
                      .map(model => getModelButton(model))}
                  </ListEntries>
                </Collapse>
                <Collapse in={editRights && coursePartsWithoutModels.length > 0}>
                  <ListEntries
                    label={t('course.models.missing-models')}
                    icon={<Warning />}
                    color="warning"
                  >
                    {coursePartsWithoutModels.map(part => (
                      <MissingModelButton
                        key={part.id}
                        part={part}
                        onClick={() =>
                          setCreateDialogOpen({open: true, coursePart: part})}
                      />
                    ))}
                  </ListEntries>
                </Collapse>
              </Box>
            )}
      </Collapse>

      {currentModel !== null && (
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
                  value:
                    findBestGrade(
                      task.grades,
                      getCoursePartExpiryDate(
                        courseParts.data,
                        courseTasks.data,
                        task.courseTaskId
                      )
                    )?.grade ?? 0,
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
