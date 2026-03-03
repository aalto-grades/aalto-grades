// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {type JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {
  AplusCourseData,
  EditCourseTaskData,
  ExtServiceExerciseData,
  NewCourseTaskData,
  NewExtServiceGradeSourceData,
} from '@/common/types';
import CreateServiceCourseTasks from '@/components/course/course-parts-view/services-components/CreateServiceCourseTasks';
import SelectServiceCourse from '@/components/course/course-parts-view/services-components/SelectServiceCourse';
import SelectServiceGradeSources from '@/components/course/course-parts-view/services-components/SelectServiceGradeSources';
import ServiceTokenDialog from '@/components/shared/auth/ServiceTokenDialog';
import {useAddExtServiceGradeSources, useFetchExtServiceCourses} from '@/hooks/api/extServices';
import {useModifyCourseTasks} from '@/hooks/useApi';
import {getServiceToken} from '@/utils';

type PropsType = {
  open: boolean;
  onClose: () => void;
  coursePartId: number | null;
  serviceInfo: {id: string; label: string; tokenLink: string};
};

export const NewServiceCourseTasksDialog = ({
  open,
  onClose,
  coursePartId,
  serviceInfo,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const serviceCourses = useFetchExtServiceCourses(serviceInfo, {
    enabled: Boolean(getServiceToken(serviceInfo.id)),
  });
  const modifyCourseTasks = useModifyCourseTasks(courseId);
  // const addAplusGradeSources = useAddAplusGradeSources(courseId);
  const addExtServiceGradeSources = useAddExtServiceGradeSources(
    serviceInfo,
    courseId,
  );

  const [step, setStep] = useState<number>(0);
  const [serviceCourse, setServiceCourse] = useState<AplusCourseData | null>(
    null,
  );

  const [newTasks, setNewTasks] = useState<
    [NewCourseTaskData, NewExtServiceGradeSourceData][]
  >([]);

  const serviceTokenDialogOpen =
    open && (!getServiceToken(serviceInfo.id) || serviceCourses.isError);

  const handleResetAndClose = (): void => {
    setStep(0);
    setServiceCourse(null);
    setNewTasks([]);
    onClose();
  };

  const handleSelectionChange = (
    checked: boolean,
    name: string,
    maxGrade: number,
    source: ExtServiceExerciseData[number]['items'][number],
    // source: ExtServiceExerciseData[0]['items'][number],
  ): void => {
    if (serviceCourse === null) {
      return;
    }

    const newSource: NewExtServiceGradeSourceData = {
      id: source.id,
      sourceType: source.sourceType,
      itemname: source.itemname ?? '',
      extServiceCourse: serviceCourse,
      courseTaskId: 0,
    };

    if (checked) {
      setNewTasks(oldTasks => [
        ...oldTasks,
        [
          {
            name: name,
            coursePartId: coursePartId!,
            daysValid: null,
            maxGrade: maxGrade,
          },
          newSource,
        ],
      ]);
    } else {
      setNewTasks(oldTasks =>
        oldTasks.filter(
          ([_, oldSource]) => oldSource.id !== newSource.id,
        ),
      );
    }
  };

  const handleCourseTaskChange = (
    index: number,
    courseTaskEdit: Omit<EditCourseTaskData, 'id'>,
  ): void => {
    setNewTasks(
      newTasks.map(([courseTask, source], i) => {
        if (i === index) {
          return [
            {
              name: courseTaskEdit.name ?? courseTask.name,
              coursePartId: coursePartId!,
              daysValid:
                courseTaskEdit.daysValid !== undefined
                  ? courseTaskEdit.daysValid
                  : courseTask.daysValid,
              maxGrade:
                courseTaskEdit.maxGrade !== undefined
                  ? courseTaskEdit.maxGrade
                  : courseTask.maxGrade,
            },
            source,
          ];
        }
        return [courseTask, source];
      }),
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const courseTasks = newTasks.map(([courseTask]) => courseTask);
    const sources = newTasks.map(([, source]) => source);

    const newIds = await modifyCourseTasks.mutateAsync({add: courseTasks});
    const newSources = newIds.map((courseTaskId, i) => ({
      ...sources[i],
      courseTaskId,
    }));

    await addExtServiceGradeSources.mutateAsync(newSources);
  };

  return (
    <>
      <ServiceTokenDialog
        open={open && serviceTokenDialogOpen}
        onClose={onClose}
        onSubmit={() => {
          serviceCourses.refetch();
        }}
        serviceInfo={serviceInfo}
        error={serviceCourses.isError}
      />
      <Dialog
        open={open && !serviceTokenDialogOpen}
        onClose={handleResetAndClose}
        maxWidth="md"
        fullWidth
      >
        {step === 0 && (
          <>
            <DialogTitle>
              {t('course.parts.external-source.add')}
            </DialogTitle>
            <DialogContent>
              {serviceCourses.data !== undefined && (
                <SelectServiceCourse
                  aplusCourses={serviceCourses.data}
                  selectedAplusCourse={serviceCourse}
                  setAplusCourse={(course) => {
                    setServiceCourse(course);
                    if (course) setNewTasks([]);
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button
                disabled={!serviceCourse}
                onClick={() => setStep(step + 1)}
              >
                {t('general.next')}
              </Button>
            </DialogActions>
          </>
        )}

        {step === 1 && (
          <>
            <DialogTitle>
              {t('course.parts.external-source.select-course-tasks')}
            </DialogTitle>
            <DialogContent>
              {serviceCourse !== null && (
                <SelectServiceGradeSources
                  serviceInfo={serviceInfo}
                  aplusCourse={serviceCourse}
                  selectedGradeSources={newTasks.map(([_, s]) => s)}
                  handleChange={handleSelectionChange}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStep(step - 1)} sx={{mr: 'auto'}}>
                {t('general.back')}
              </Button>
              <Button
                disabled={newTasks.length === 0}
                onClick={() => setStep(step + 1)}
              >
                {t('general.next')}
              </Button>
            </DialogActions>
          </>
        )}

        {step === 2 && (
          <>
            <DialogTitle>{t('course.parts.create-tasks')}</DialogTitle>
            <DialogContent>
              {serviceCourse !== null && (
                <CreateServiceCourseTasks
                  courseTasksWithSource={newTasks}
                  handleChange={handleCourseTaskChange}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStep(step - 1)} sx={{mr: 'auto'}}>
                {t('general.back')}
              </Button>
              <Button
                onClick={async () => {
                  await handleSubmit();
                  handleResetAndClose();
                }}
              >
                {t('general.submit')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};
export default NewServiceCourseTasksDialog;
