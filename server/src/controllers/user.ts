// SPDX-FileCopyrightText: 2022 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import * as argon from 'argon2';
import generator from 'generate-password';
import {Op} from 'sequelize';
import {z} from 'zod';

import {
  type CourseData,
  CourseRoleType,
  type CourseWithFinalGrades,
  type FullUserData,
  HttpCode,
  type NewUser,
  type NewUserResponse,
  SystemRole,
  type UserData,
  type UserIdArray,
  type VerifyEmail,
  type VerifyEmailResponse,
} from '@/common/types';
import Course from '../database/models/course';
import CourseRole from '../database/models/courseRole';
import CourseTranslation from '../database/models/courseTranslation';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {
  ApiError,
  type CourseFull,
  type Endpoint,
  type JwtClaims,
} from '../types';
import {parseCourseFull} from './utils/course';
import {validateUserAndGrader} from './utils/taskGrade';
import {findAndValidateUserId, validateUserId} from './utils/user';

/** () => CourseData[] */
export const getOwnCourses: Endpoint<void, CourseData[]> = async (req, res) => {
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

  const courseData = [];
  for (const course of courses) {
    courseData.push(parseCourseFull(course));
  }

  res.json(courseData);
};

/**
 * () => CourseWithFinalGrades[]
 *
 * @throws ApiError(400|404)
 */
export const getCoursesOfUser: Endpoint<void, CourseWithFinalGrades[]> = async (
  req,
  res
) => {
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
        through: {attributes: ['role', 'expiryDate']},
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
      finalGrades: course.FinalGrades.map((finalGrade) => {
        const [finalGradeUser, grader] = validateUserAndGrader(finalGrade);
        return {
          id: finalGrade.id,
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

/** () => UserData[] */
export const getStudents: Endpoint<void, UserData[]> = async (req, res) => {
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
      requester.role === SystemRole.Admin
      || course.CourseRoles[0].role === CourseRoleType.Teacher;

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

/** () => FullUserData[] */
export const getUsers: Endpoint<void, FullUserData[]> = async (_req, res) => {
  const dbUsers = await User.findAll();
  const users = dbUsers.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    studentNumber: user.studentNumber,
    idpUser: user.idpUser,
    admin: user.admin,
  }));

  res.json(users);
};

/**
 * (NewUser) => NewUserResponse
 *
 * @throws ApiError(409)
 */
export const addUser: Endpoint<NewUser, NewUserResponse> = async (req, res) => {
  const email = req.body.email;

  const existingUser = await User.findByEmail(email);

  // IDP user
  if (req.body.admin === false) {
    if (existingUser !== null && !existingUser.admin) {
      throw new ApiError(
        `IDP user with email ${email} already exists`,
        HttpCode.Conflict
      );
    }

    if (existingUser) {
      // Update existing user
      await existingUser.set({idpUser: true}).save();
    } else {
      await User.create({email, idpUser: true});
    }
    return res.status(HttpCode.Created).json({temporaryPassword: null});
  }

  // Admin user
  if (existingUser !== null && existingUser.admin) {
    throw new ApiError(
      `Admin user with email ${email} already exists`,
      HttpCode.Conflict
    );
  }

  const temporaryPassword = generator.generate({
    length: 16,
    numbers: true,
  });
  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  const password = await argon.hash(temporaryPassword, {
    type: argon.argon2id,
    memoryCost: 19456,
    parallelism: 1,
    timeCost: 2,
  });

  if (existingUser) {
    // Update existing user
    await existingUser
      .set({
        name: req.body.name,
        admin: true,
        password,
        forcePasswordReset: true,
      })
      .save();
  } else {
    await User.create({
      name: req.body.name,
      email: req.body.email,
      admin: true,
      password,
      forcePasswordReset: true,
    });
  }

  return res.status(HttpCode.Created).json({temporaryPassword});
};

/**
 * (VerifyEmail) => VerifyEmailResponse
 *
 * @throws ApiError(400)
 */
export const verifyEmail: Endpoint<VerifyEmail, VerifyEmailResponse> = async (
  req,
  res
) => {
  const email = req.body.email;

  const existingUser = await User.findByEmail(email);

  if (existingUser !== null) {
    return res.json({exists: true});
  } else {
    return res.json({exists: false});
  }
};

/**
 * () => void
 *
 * @throws ApiError(400|404)
 */
export const deleteUser: Endpoint<void, void> = async (req, res) => {
  let role: 'idpUser' | 'admin' | null = null;
  if (req.query.role) {
    try {
      role = z
        .union([z.literal('idpUser'), z.literal('admin')])
        .parse(req.query.role);
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(error.message, HttpCode.BadRequest);
      }
    }
  }

  const user = await findAndValidateUserId(req.params.userId);

  // Remove idpUser role
  if (role === 'idpUser') {
    if (!user.idpUser) {
      throw new ApiError('User is not an IDP user', HttpCode.Conflict);
    }
    await user.set({idpUser: false}).save();

    return res.sendStatus(HttpCode.Ok);
  }

  // Remove admin role
  if (role === 'admin') {
    if (!user.admin) {
      throw new ApiError('User is not an admin', HttpCode.Conflict);
    }
    await user
      .set({
        admin: false,
        password: null,
        forcePasswordReset: null,
        mfaSecret: null,
        mfaConfirmed: false,
      })
      .save();
  }

  // No role specified, delete user
  if (role === null) await user.destroy();

  res.sendStatus(HttpCode.Ok);
};

/**
 * (UserIdArray) => void
 *
 * @throws ApiError(404)
 */
export const deleteUsers: Endpoint<UserIdArray, void> = async (req, res) => {
  const dbUsers = await User.findAll({where: {id: req.body}});
  if (dbUsers.length < req.body.length)
    throw new ApiError('Some users not found', HttpCode.NotFound);

  await User.destroy({where: {id: req.body}});
  res.sendStatus(HttpCode.Ok);
};
