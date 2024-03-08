// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData} from '@common/types';
import {Box, Button, Chip, IconButton} from '@mui/material';
import {UseQueryResult} from '@tanstack/react-query';
import {JSX, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {AccessTime, Delete, Tag} from '@mui/icons-material';
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
    <>
      <Button onClick={() => setOpen(true)}>Add attainment</Button>
      <Box
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
        sx={{mx: -2.5}}
      >
        {attainments.data &&
          attainments.data.map((attainment: AttainmentData) => (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              key={attainment.id}
            >
              <Box
                sx={{
                  border: 1,
                  borderColor: 'info.grey',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <p>{attainment.name}</p>
                <Chip
                  icon={<Tag />}
                  label={`${attainment.id}`}
                  variant="outlined"
                  size="small"
                  sx={{mr: 1}}
                />
                <Chip
                  icon={<AccessTime />}
                  label={`${attainment.daysValid} days`}
                  variant="outlined"
                  size="small"
                />

                {/* <Button
                  onClick={() =>
                    deleteAttainment.mutate({
                      courseId: courseId,
                      attainmentId: attainment.id,
                    })
                  }
                >
                  Delete
                </Button> */}
                <IconButton
                  onClick={() =>
                    deleteAttainment.mutate({
                      courseId,
                      attainmentId: attainment.id,
                    })
                  }
                  aria-description="delete attainment"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          ))}
        <NewAttainmentDialog handleClose={handleClose} open={open} />
      </Box>
    </>
  );
}
