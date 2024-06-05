// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {Op} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  CourseData,
  CourseRoleType,
  FinalGradeData,
  HttpCode,
  IdpUsers,
  NewIdpUserSchema,
  SystemRole,
} from '@/common/types';
import {parseCourseFull} from './utils/course';
import {validateUserAndGrader} from './utils/grades';
import {findAndValidateUserId, validateUserId} from './utils/user';
import Course from '../database/models/course';
import CourseRole from '../database/models/courseRole';
import CourseTranslation from '../database/models/courseTranslation';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {ApiError, CourseFull, JwtClaims} from '../types';

/** Responds with CourseData[] */
export const getOwnCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = req.user as JwtClaims;

  const courses: CourseFull[] = (await Course.findAll({
    include: [
      {model: CourseTranslation},
      {
        model: User,
        as: 'Users',
        where: {id: user.id},
      },
    ],
  })) as CourseFull[];

  const courseData: CourseData[] = [];
  for (const course of courses) {
    courseData.push(parseCourseFull(course));
  }

  res.json(courseData);
};

/**
 * Responds with null
 *
 * @throws ApiError(400|404)
 */
export const getGradesOfUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = await validateUserId(req.params.userId);
  const user = req.user as JwtClaims;

  if (userId !== user.id && user.role !== SystemRole.Admin) {
    throw new ApiError("Cannot access user's data", HttpCode.Forbidden);
  }

  type DBData = CourseFull & {FinalGrades: FinalGrade[]};
  const courses: DBData[] = (await Course.findAll({
    include: [
      {model: CourseTranslation},
      {
        model: User,
        through: {attributes: ['role']},
      },
      // Add final grades to the data
      {
        model: FinalGrade,
        as: 'FinalGrades',
        where: {userId: userId},
        required: false,
        include: [
          {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
          {
            model: User,
            as: 'grader',
            attributes: ['id', 'name', 'email', 'studentNumber'],
          },
        ],
      },
      // Filter by user being in course and requester having assistant or teacher role
      {
        model: CourseRole,
        where: {
          [Op.or]: [
            {
              userId: user.id,
              role: {
                [Op.in]: [CourseRoleType.Teacher, CourseRoleType.Assistant],
              },
            },
            {
              userId: userId,
              role: CourseRoleType.Student,
            },
          ],
        },
        attributes: ['role'], // remove data
      },
    ],
  })) as DBData[];
  // TODO: Filter by having both roles in courserole & edit DBData type to include both

  type DataType = CourseData & {finalGrades: FinalGradeData[]};
  const userGrades: DataType[] = [];
  for (const course of courses) {
    userGrades.push({
      ...parseCourseFull(course),
      finalGrades: course.FinalGrades.map(finalGrade => {
        const [finalGradeUser, grader] = validateUserAndGrader(finalGrade);
        return {
          finalGradeId: finalGrade.id,
          user: finalGradeUser,
          courseId: finalGrade.courseId,
          gradingModelId: finalGrade.gradingModelId,
          grader: grader,
          grade: finalGrade.grade,
          date: new Date(finalGrade.date),
          sisuExportDate: finalGrade.sisuExportDate,
          comment: finalGrade.comment,
        };
      }),
    });
  }

  res.json(userGrades);
};

/** Responds with IdpUsers */
export const getIdpUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const idpUsers = await User.findIdpUsers();
  const users: IdpUsers = idpUsers.map(user => ({
    email: user.email,
    id: user.id,
  }));

  res.json(users);
};

/** @throws ApiError(409) */
export const addIdpUser = async (
  req: TypedRequestBody<typeof NewIdpUserSchema>,
  res: Response
): Promise<void> => {
  const email = req.body.email;

  const userAlreadyExists = await User.findIdpUserByEmail(email);
  if (userAlreadyExists) {
    throw new ApiError('User already exists', HttpCode.Conflict);
  }

  await User.create({email: email, role: SystemRole.User, name: email});
  res.sendStatus(HttpCode.Created);
};

/** @throws ApiError(400|404) */
export const deleteIdpUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await findAndValidateUserId(req.params.userId);
  await user.destroy();
  res.sendStatus(HttpCode.Ok);
};
