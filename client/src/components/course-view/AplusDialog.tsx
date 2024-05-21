// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  TextField,
} from '@mui/material';
import {useState} from 'react';

import {AplusCourseData} from '@/common/types';
import {useFetchAplusCourses} from '../../hooks/useApi';

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

const AplusDialog = ({
  handleClose,
  open,
}: PropsType): JSX.Element => {
  const aplusCourses = useFetchAplusCourses();

  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>A+ Courses</DialogTitle>
      <DialogContent>
        {step === 0 && aplusCourses.data && aplusCourses.data.map(aplusCourse =>
          <Button
            onClick={() => {
              setAplusCourse(aplusCourse);
              setStep(1);
            }}
          >
            {aplusCourse.name}
          </Button>
        )}
        {step === 1 && aplusCourse && (
          <p>{aplusCourse.name}</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AplusDialog;
