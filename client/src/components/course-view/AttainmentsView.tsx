// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData} from '@common/types';
import {Box, Button} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {JSX, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {
  useAddAttainment,
  useDeleteAttainment,
  useGetAttainments,
} from '../../hooks/useApi';
import NewAttainmentDialog from './NewAttainmentDialog';

export default function CourseView(): JSX.Element {
  const {courseId}: Params = useParams() as {courseId: string};
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const attainments: UseQueryResult<Array<AttainmentData>> =
    useGetAttainments(courseId);
  const addAttainment = useAddAttainment();
  const deleteAttainment = useDeleteAttainment();

  return (
    <Box sx={{mx: -2.5}}>
      <Button onClick={() => setOpen(true)}>Add attainment</Button>
      {attainments.data &&
        attainments.data.map((attainment: AttainmentData) => (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            key={attainment.id}
          >
            <p>
              {attainment.id} {attainment.name} {attainment.daysValid}{' '}
            </p>

            <Button
              onClick={() =>
                deleteAttainment.mutate({
                  courseId: courseId,
                  attainmentId: attainment.id,
                })
              }
            >
              Delete
            </Button>
          </Box>
        ))}
      <NewAttainmentDialog handleClose={handleClose} open={open} />
    </Box>
  );
}
