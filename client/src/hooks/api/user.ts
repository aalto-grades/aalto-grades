// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from 'aalto-grades-common/types';
import axios from './axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { Numeric } from '../../types';

export function useGetCoursesOfUser(userId: Numeric): UseQueryResult<Array<CourseData>> {
  return useQuery({
    queryKey: ['courses-of-user', userId],
    queryFn: async () => (
      await axios.get(`/v1/user/${userId}/courses`)
    ).data.data.courses
  });
}
