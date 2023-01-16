// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';

export interface CourseWithTranslationAndInstance extends Course {
  CourseTranslations: Array<CourseTranslation>
  CourseInstances: Array<CourseInstance>
}
