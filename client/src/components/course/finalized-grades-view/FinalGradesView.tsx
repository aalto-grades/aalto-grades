// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams, useViewTransitionState} from 'react-router-dom';

import Delayed from '@/components/shared/Delay';
import {FinalGradesTableProvider} from '@/context/FinalGradesTableProvider';
import {useGetFinalGrades} from '@/hooks/useApi';
import FinalGradesTable from './FinalGradesTable';
import FinalGradesToolbar from './FinalGradesToolbar';

const FinalGradesView = (): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const isTransitioning = useViewTransitionState('');
  const finalGradesQuery = useGetFinalGrades(courseId);

  return (
    <Box
      sx={{
        textAlign: 'left',
        alignItems: 'left'
      }}
    >
      <Typography
        variant="h2"
        sx={{
          width: 'fit-content'
        }}
      >
        {t('general.final-grades')}
      </Typography>
      {finalGradesQuery.data !== undefined && !isTransitioning && (
        <Delayed>
          <FinalGradesTableProvider data={finalGradesQuery.data}>
            <FinalGradesToolbar />
            <FinalGradesTable />
          </FinalGradesTableProvider>
        </Delayed>
      )}
    </Box>
  );
};

export default FinalGradesView;
