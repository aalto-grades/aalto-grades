// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {Navigate, useParams} from 'react-router-dom';

import {
  useGetAllGradingModels,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';

const CourseRedirect = (): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const gradingModels = useGetAllGradingModels(courseId);

  if (
    courseParts.data === undefined ||
    courseTasks.data === undefined ||
    gradingModels.data === undefined
  )
    return <>{t('general.loading')}</>;

  return courseParts.data.length > 0 && courseTasks.data.length > 0 ? (
    gradingModels.data.length > 0 ? (
      <Navigate to={`/${courseId}/course-results`} />
    ) : (
      <Navigate to={`/${courseId}/models`} />
    )
  ) : (
    <Navigate to={`/${courseId}/course-parts`} />
  );
};

export default CourseRedirect;
