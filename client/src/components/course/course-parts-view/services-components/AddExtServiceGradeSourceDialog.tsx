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
  ExtServiceCourseData,
  ExtServiceExerciseData,
  ExternalSourceData,
  NewExtServiceGradeSourceData,
} from '@/common/types';
import SelectServiceCourse from '@/components/course/course-parts-view/services-components/SelectServiceCourse';
import ServiceTokenDialog from '@/components/shared/auth/ServiceTokenDialog';
import {useAddExtServiceGradeSources, useFetchExtServiceCourses} from '@/hooks/useApi';
import {getServiceToken,} from '@/utils';
import SelectServiceGradeSource from './SelectServiceGradeSource';

type PropsType = {
  onClose: () => void;
  courseTaskId: number | null;
  externalSources: ExternalSourceData[];
  serviceInfo: {id: string; label: string; tokenLink: string};
};

const AddExtServiceGradeSourceDialog = ({
  onClose,
  courseTaskId,
  externalSources,
  serviceInfo,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const serviceCourses = useFetchExtServiceCourses(serviceInfo, {
    enabled: Boolean(getServiceToken(serviceInfo.id)),
  });
  const addExtServiceGradeSources = useAddExtServiceGradeSources(
    serviceInfo,
    courseId,
  );

  const [step, setStep] = useState<number>(0);
  const [serviceCourse, setServiceCourse] = useState<ExtServiceCourseData | null>(
    null,
  );
  const open = courseTaskId !== null;
  const serviceTokenDialogOpen =
    open && (!getServiceToken(serviceInfo.id) || serviceCourses.isError);

  const handleResetAndClose = (): void => {
    setStep(0);
    setServiceCourse(null);
    onClose();
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
              {t('course.parts.external-source.add-source', {
                source: serviceInfo.label,
              })}
            </DialogTitle>
            <DialogContent>
              {serviceCourses.data !== undefined && (
                <SelectServiceCourse
                  aplusCourses={serviceCourses.data}
                  selectedAplusCourse={serviceCourse}
                  setAplusCourse={setServiceCourse}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button disabled={!serviceCourse} onClick={() => setStep(step + 1)}>
                {t('general.next')}
              </Button>
            </DialogActions>
          </>
        )}

        {step === 1 && (
          <>
            <DialogTitle>{t('course.parts.select-grade-source')}</DialogTitle>
            <DialogContent>
              {serviceCourse !== null && (
                <SelectServiceGradeSource
                  aplusCourse={serviceCourse}
                  selectedGradeSources={externalSources}
                  serviceInfo={serviceInfo}
                  handleSelect={(
                    source: ExtServiceExerciseData[number]['items'][number],
                  ) => {
                    if (courseTaskId !== null) {
                      const newSource: NewExtServiceGradeSourceData = {
                        id: source.id,
                        sourceType: source.sourceType,
                        itemname: source.itemname ?? '',
                        extServiceCourse: serviceCourse,
                        courseTaskId,
                      };

                      addExtServiceGradeSources.mutate([
                        newSource,
                      ]);
                    }
                    handleResetAndClose();
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStep(step - 1)}>
                {t('general.back')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default AddExtServiceGradeSourceDialog;
