// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData } from './course';

export interface UserData {
  id?: number,
  name?: string
}

export interface CoursesOfUser {
  current: Array<CourseData>,
  previous: Array<CourseData>
}
