// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Dialog, DialogContent, DialogTitle, Typography} from '@mui/material';
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
          <Typography>{JSON.stringify(source)}</Typography>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ViewAplusGradeSourcesDialog;
