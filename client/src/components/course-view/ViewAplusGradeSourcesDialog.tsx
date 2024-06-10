// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {JSX} from 'react';

import {AplusGradeSourceData} from '@/common/types';

type PropsType = {
  handleClose: () => void;
  open: boolean;
  aplusGradeSources: AplusGradeSourceData[];
};

const ViewAplusGradeSourcesDialog = ({
  handleClose,
  open,
  aplusGradeSources,
}: PropsType): JSX.Element => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>A+ grade sources</DialogTitle>
      <DialogContent>
        {aplusGradeSources.map(source => (
          // TODO: Actual design
          <Typography>{JSON.stringify(source)}</Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAplusGradeSourcesDialog;
