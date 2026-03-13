// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Divider, Stack} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {CourseData, GradingModelData} from '@/common/types';
import DashboardCard from '@/components/course/overview/DashboardCard';
import DetailItem from '@/components/course/overview/DetailItem';

interface CourseInfoCardProps {
  course: CourseData;
  gradingModels: GradingModelData[] | undefined;
}

const CourseInfoCard = ({
  course,
  gradingModels,
}: CourseInfoCardProps): JSX.Element => {
  const {t} = useTranslation();

  return (
    <DashboardCard title={t('course.dashboard.info')}>
      <Stack spacing={1.5}>
        <DetailItem
          label={t('course.dashboard.credits')}
          value={
            course.minCredits === course.maxCredits
              ? `${course.minCredits}`
              : `${course.minCredits} - ${course.maxCredits}`
          }
        />
        <DetailItem
          label={t('course.dashboard.language')}
          value={course.languageOfInstruction}
        />
        <DetailItem
          label={t('course.dashboard.grading-scale')}
          value={course.gradingScale}
        />
        <Divider />
        <DetailItem
          label={t('general.teachers')}
          value={course.teachersInCharge.length || 0}
        />
        <DetailItem
          label={t('general.assistants')}
          value={course.assistants.length || 0}
        />
        <DetailItem
          label={t('course.dashboard.models')}
          value={gradingModels?.length || 0}
        />
      </Stack>
    </DashboardCard>
  );
};

export default CourseInfoCard;
