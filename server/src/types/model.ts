// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// This file defines extensions of Sequelize models to represent query results.

import {CourseRoleType} from '@/common/types';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

export type UserWithRole = User & {CourseRole: {role: CourseRoleType}};

export type CourseFull = Course & {
  CourseTranslations: CourseTranslation[];
  Users: UserWithRole[];
};
