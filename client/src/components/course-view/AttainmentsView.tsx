// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData} from '@common/types';
import {Box, Button, Chip, IconButton, Typography} from '@mui/material';
import {JSX, useState} from 'react';
import {Params, useParams} from 'react-router-dom';

import {AccessTime, Delete, Tag} from '@mui/icons-material';
import {useDeleteAttainment, useGetAttainments} from '../../hooks/useApi';
import NewAttainmentDialog from './NewAttainmentDialog';

export default function CourseView(): JSX.Element {
  const {courseId}: Params = useParams() as {courseId: string};
  const deleteAttainment = useDeleteAttainment();
  const attainments = useGetAttainments(courseId);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setAddDialogOpen(true)}>Add attainment</Button>
      <NewAttainmentDialog
        handleClose={() => setAddDialogOpen(false)}
        open={addDialogOpen}
      />
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
                <Typography sx={{py: 1.7}}>{attainment.name}</Typography>
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
      </Box>
    </>
  );
}
