// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {Op} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  CourseData,
  CourseRoleType,
  CourseWithFinalGrades,
  HttpCode,
  IdpUsers,
  NewIdpUserSchema,
  SystemRole,
  UserData,
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
 * Responds with CourseWithFinalGrades[]
 *
 * @throws ApiError(400|404)
 */
export const getGradesOfUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = await validateUserId(req.params.userId);
  const requester = req.user as JwtClaims;

  const needsRole =
    requester.id !== userId && requester.role !== SystemRole.Admin;
  const roleFilter = needsRole
    ? [
        {
          userId: requester.id,
          role: {
            [Op.in]: [CourseRoleType.Teacher, CourseRoleType.Assistant],
          },
        },
      ]
    : [];

  type DBData = CourseFull & {
    FinalGrades: FinalGrade[];
    CourseRoles: CourseRole[];
  };
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
            ...roleFilter,
            {
              userId: userId,
              role: CourseRoleType.Student,
            },
          ],
        },
        attributes: ['userId'], // remove data
      },
    ],
  })) as DBData[];

  const userGrades: CourseWithFinalGrades[] = [];
  for (const course of courses) {
    // Validate that the user and the requester exist in the course roles
    const roleUsers = new Set(course.CourseRoles.map(role => role.userId));
    if (!roleUsers.has(userId) || (needsRole && !roleUsers.has(requester.id)))
      continue;

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

/** Responds with User[] */
export const getStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requester = req.user as JwtClaims;

  type DBData = Course & {
    Users: (User & {CourseRole: CourseRole})[];
    CourseRoles: CourseRole[];
  };
  let courses: DBData[];
  if (requester.role !== SystemRole.Admin) {
    courses = (await Course.findAll({
      include: [
        {model: CourseTranslation},
        {model: User, through: {attributes: ['role']}},
        // Filter by user being in course and requester having assistant or teacher role
        {
          model: CourseRole,
          where: {
            userId: requester.id,
            role: {
              [Op.in]: [CourseRoleType.Teacher, CourseRoleType.Assistant],
            },
          },
          attributes: ['role'], // remove data
        },
      ],
    })) as DBData[];
  } else {
    courses = (await Course.findAll({
      include: [
        {model: CourseTranslation},
        {model: User, through: {attributes: ['role']}},
      ],
    })) as DBData[];
  }

  const users = new Map<number, UserData>();
  for (const course of courses) {
    const isTeacher =
      requester.role === SystemRole.Admin ||
      course.CourseRoles[0].role === CourseRoleType.Teacher;

    for (const user of course.Users) {
      if (user.CourseRole.role !== CourseRoleType.Student) continue;
      if (isTeacher) {
        users.set(user.id, {
          id: user.id,
          name: user.name,
          email: user.email,
          studentNumber: user.studentNumber,
        });
      } else if (!users.has(user.id)) {
        // Assistants shouldn't see names and emails
        users.set(user.id, {
          id: user.id,
          name: null,
          email: null,
          studentNumber: user.studentNumber,
        });
      }
    }
  }
  res.json(Array.from(users.values()));
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
