// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// This file defines extensions of Sequelize models to represent query results.

import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

export interface CourseFull extends Course {
  CourseTranslations: CourseTranslation[];
  Users: User[];
  inCourse?: User[];
}
