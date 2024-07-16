// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {
  NewAplusGradeSourceData,
  AplusCourseData,
  AplusGradeSourceData,
} from '@/common/types';
import SelectAplusCourse from './SelectAplusCourse';
import SelectAplusGradeSource from './SelectAplusGradeSource';
import {
  useAddAplusGradeSources,
  useFetchAplusCourses,
} from '../../hooks/useApi';
import {getAplusToken} from '../../utils/utils';
import AplusTokenDialog from '../shared/AplusTokenDialog';

type PropsType = {
  handleClose: () => void;
  coursePartId: number | null;
  aplusGradeSources: AplusGradeSourceData[];
};

const AddAplusGradeSourceDialog = ({
  handleClose,
  coursePartId,
  aplusGradeSources,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const aplusCourses = useFetchAplusCourses({enabled: !!getAplusToken()});
  const addAplusGradeSources = useAddAplusGradeSources(courseId);

  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const open = coursePartId !== null;

  const handleResetAndClose = (): void => {
    setStep(0);
    setAplusCourse(null);
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleResetAndClose}>
        {step === 0 && <DialogTitle>A+ courses</DialogTitle>}
        {step === 1 && <DialogTitle>Select grade source</DialogTitle>}
        <DialogContent>
          {step === 0 && aplusCourses.data && (
            <SelectAplusCourse
              aplusCourses={aplusCourses.data}
              setAplusCourse={setAplusCourse}
            />
          )}
          {step === 1 && aplusCourse && (
            <SelectAplusGradeSource
              aplusCourse={aplusCourse}
              aplusGradeSources={aplusGradeSources}
              handleSelect={(aplusGradeSource: NewAplusGradeSourceData) => {
                if (coursePartId !== null) {
                  addAplusGradeSources.mutate([
                    {
                      ...aplusGradeSource,
                      coursePartId,
                    },
                  ]);
                }
                handleResetAndClose();
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {step === 0 && (
            <Button disabled={!aplusCourse} onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
          {step === 1 && (
            <Button onClick={() => setStep(step - 1)}>Back</Button>
          )}
        </DialogActions>
      </Dialog>
      <AplusTokenDialog
        handleClose={handleClose}
        handleSubmit={() => {
          setAplusTokenDialogOpen(false);
          aplusCourses.refetch();
        }}
        open={aplusTokenDialogOpen && open}
        error={aplusCourses.isError}
      />
    </>
  );
};

export default AddAplusGradeSourceDialog;
