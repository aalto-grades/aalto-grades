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
  AplusGradeSourceData,
  NewAplusGradeSourceData,
} from '@/common/types';
import TokenDialog from '@/components/shared/auth/TokenDialog';
import {useAddAplusGradeSources, useFetchAplusCourses} from '@/hooks/useApi';
import {getToken} from '@/utils';
import SelectAplusCourse from './aplus-components/SelectAplusCourse';
import SelectAplusGradeSource from './aplus-components/SelectAplusGradeSource';

type PropsType = {
  onClose: () => void;
  courseTaskId: number | null;
  aplusGradeSources: AplusGradeSourceData[];
};

const AddAplusGradeSourceDialog = ({
  onClose,
  courseTaskId,
  aplusGradeSources,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const aplusCourses = useFetchAplusCourses({
    enabled: Boolean(getToken()),
  });
  const addAplusGradeSources = useAddAplusGradeSources(courseId);

  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const open = courseTaskId !== null;
  const aplusTokenDialogOpen = open && (!getToken() || aplusCourses.isError); // Open/close token dialog if token exists or an error occurred while fetching courses

  const handleResetAndClose = (): void => {
    setStep(0);
    setAplusCourse(null);
    onClose();
  };

  return (
    <>
      <TokenDialog
        open={aplusTokenDialogOpen && open}
        onClose={onClose}
        onSubmit={() => {
          aplusCourses.refetch();
        }}
        error={aplusCourses.isError}
      />
      <Dialog
        open={open && !aplusTokenDialogOpen}
        onClose={handleResetAndClose}
        maxWidth="md"
        fullWidth
      >
        {step === 0 && (
          <>
            <DialogTitle>{t('general.a+-courses')}</DialogTitle>
            <DialogContent>
              {aplusCourses.data !== undefined && (
                <SelectAplusCourse
                  aplusCourses={aplusCourses.data}
                  selectedAplusCourse={aplusCourse}
                  setAplusCourse={setAplusCourse}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button disabled={!aplusCourse} onClick={() => setStep(step + 1)}>
                {t('general.next')}
              </Button>
            </DialogActions>
          </>
        )}

        {step === 1 && (
          <>
            <DialogTitle>{t('course.parts.select-grade-source')}</DialogTitle>
            <DialogContent>
              {aplusCourse !== null && (
                <SelectAplusGradeSource
                  aplusCourse={aplusCourse}
                  aplusGradeSources={aplusGradeSources}
                  handleSelect={(aplusGradeSource: NewAplusGradeSourceData) => {
                    if (courseTaskId !== null) {
                      addAplusGradeSources.mutate([
                        {...aplusGradeSource, courseTaskId},
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

export default AddAplusGradeSourceDialog;
