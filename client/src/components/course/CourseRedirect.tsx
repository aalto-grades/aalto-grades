// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {JSX} from 'react';
import {Navigate, useParams} from 'react-router-dom';

import {useGetCourseParts} from '@/hooks/useApi';

const CourseRedirect = (): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const courseParts = useGetCourseParts(courseId);

  if (courseParts.data === undefined) return <></>;

  return (
    <>
      {courseParts.data.length > 0 ? (
        <Navigate to={`/${courseId}/course-results`} />
      ) : (
        <Navigate to={`/${courseId}/course-parts`} />
      )}
    </>
  );
};

export default CourseRedirect;
