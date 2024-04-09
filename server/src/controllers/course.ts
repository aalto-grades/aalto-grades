// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {Transaction} from 'sequelize';

import {
  CourseData,
  CourseRoleType,
  CreateCourseData,
  HttpCode,
  Language,
  PartialCourseData,
} from '@common/types';
import {sequelize} from '../database';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import TeacherInCharge from '../database/models/teacherInCharge';
import User from '../database/models/user';
import {ApiError, CourseFull} from '../types';
import {
  findAndValidateCourseId,
  findCourseFullById,
  parseCourseFull,
  validateCourseId,
  validateEmailList,
} from './utils/course';
import CourseRole from '../database/models/courseRole';
import logger from '../configs/winston';

/**
 * Responds with CourseData
 */
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const courseId = await validateCourseId(req.params.courseId);

  const courseData: CourseData = parseCourseFull(
    await findCourseFullById(courseId)
  );

  res.json(courseData);
};

/**
 * Responds with CourseData[]
 */
export const getAllCourses = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const courses: Array<CourseFull> = (await Course.findAll({
    include: [
      {
        model: CourseTranslation,
      },
      {
        model: User,
        as: 'Users',
      },
    ],
  })) as Array<CourseFull>;

  const coursesData: CourseData[] = [];

  for (const course of courses) {
    coursesData.push(parseCourseFull(course));
  }

  res.json(coursesData);
};

/**
 * Responds with number
 */
export const addCourse = async (
  req: Request<ParamsDictionary, unknown, CreateCourseData>,
  res: Response
): Promise<void> => {
  const teachers = await validateEmailList(req.body.teachersInCharge);
  const assistants =
    req.body.assistants !== undefined
      ? await validateEmailList(req.body.assistants)
      : null

  const course = await sequelize.transaction(async (t): Promise<Course> => {
    const newCourse = await Course.create(
      {
        courseCode: req.body.courseCode,
        minCredits: req.body.minCredits,
        maxCredits: req.body.maxCredits,
        gradingScale: req.body.gradingScale,
        languageOfInstruction: req.body.languageOfInstruction.toUpperCase(),
      },
      {transaction: t}
    );

    await CourseTranslation.bulkCreate(
      [
        {
          courseId: newCourse.id,
          language: Language.Finnish,
          department: req.body.department.fi,
          courseName: req.body.name.fi,
        },
        {
          courseId: newCourse.id,
          language: Language.English,
          department: req.body.department.en,
          courseName: req.body.name.en,
        },
        {
          courseId: newCourse.id,
          language: Language.Swedish,
          department: req.body.department.sv,
          courseName: req.body.name.sv,
        },
      ],
      {transaction: t}
    );

    const teachersInCharge = teachers.map(teacher => ({
      courseId: newCourse.id as number,
      userId: teacher.id as number,
    })) as TeacherInCharge[];

    await TeacherInCharge.bulkCreate(teachersInCharge, {transaction: t});

    if (assistants !== null) {
      const assistantRoles: Array<CourseRole> = assistants.map(
        (assistant: User) => {
          return {
            courseId: newCourse.id,
            userId: assistant.id,
            role: CourseRoleType.Assistant,
          };
        }
      ) as Array<CourseRole>;
      await CourseRole.bulkCreate(assistantRoles, {transaction: t});
    }

    return newCourse;
  }
  );

  res.status(HttpCode.Created).json(course.id);
}

// export async function editCourse(req: Request, res: Response): Promise<void> {
//   const requestSchema: yup.AnyObjectSchema = yup.object().shape({
//     courseCode: yup.string().notRequired(),
//     minCredits: yup.number().min(0).notRequired(),
//     maxCredits: yup.number().min(yup.ref('minCredits')).notRequired(),
//     gradingScale: yup.string().oneOf(Object.values(GradingScale)).notRequired(),
//     languageOfInstruction: yup
//       .string()
//       .transform((value: string, originalValue: string) => {
//         return originalValue ? originalValue.toUpperCase() : value;
//       })
//       .oneOf(Object.values(Language))
//       .notRequired(),
//     teachersInCharge: yup
//       .array()
//       .of(
//         yup.object().shape({
//           email: yup.string().email().required(),
//         })
//       )
//       .notRequired(),
//     assistants: yup
//       .array()
//       .of(
//         yup.object().shape({
//           email: yup.string().email().required(),
//         })
//       )
//       .notRequired(),
//     department: localizedStringSchema.notRequired(),
//     name: localizedStringSchema.notRequired(),
//     return newCourse;
//   });

//   res.status(HttpCode.Created).json(course.id);
// };

export const editCourse = async (
  req: Request<ParamsDictionary, unknown, PartialCourseData>,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);

  const {
    courseCode,
    minCredits,
    maxCredits,
    gradingScale,
    languageOfInstruction,
    teachersInCharge,
    department,
    name,
    assistants,
  } = req.body;

  if (
    minCredits !== undefined &&
    maxCredits === undefined &&
    minCredits > course.maxCredits
  ) {
    throw new ApiError(
      `without updating max credits, new min credits (${minCredits}) can't be` +
        ` larger than existing max credits (${course.maxCredits})`,
      HttpCode.BadRequest
    );
  } else if (
    maxCredits !== undefined &&
    minCredits === undefined &&
    maxCredits < course.minCredits
  ) {
    throw new ApiError(
      `without updating min credits, new max credits (${maxCredits}) can't be` +
        ` smaller than existing min credits (${course.minCredits})`,
      HttpCode.BadRequest
    );
  }

  const newTeachers =
    teachersInCharge !== undefined
      ? await validateEmailList(teachersInCharge)
      : null;

  const newAssistants: Array<User> | null =
    assistants !== undefined
      ? await validateEmailList(assistants)
      : null;

  await sequelize.transaction(async (t: Transaction): Promise<void> => {
    await Course.update(
      {
        courseCode: courseCode,
        minCredits: minCredits,
        maxCredits: maxCredits,
        gradingScale: gradingScale,
        languageOfInstruction: languageOfInstruction,
      },
      {
        where: {id: course.id},
        transaction: t,
      }
    );

    const updateTranslation = async (
      language: Language,
      key: 'en' | 'fi' | 'sv'
    ): Promise<void> => {
      await CourseTranslation.update(
        {
          department: department ? department[key] : undefined,
          courseName: name ? name[key] : undefined,
        },
        {
          where: {courseId: course.id, language: language},
          transaction: t,
        }
      );
    };

    await updateTranslation(Language.English, 'en');
    await updateTranslation(Language.Finnish, 'fi');
    await updateTranslation(Language.Swedish, 'sv');

    if (newTeachers !== null) {
      const oldTeachers = await TeacherInCharge.findAll({
        where: {courseId: course.id},
      });

      // Delete teachers who are not in the newTeachers array.
      for (const oldTeacher of oldTeachers) {
        // Find old teacher index in new teacher list.
        const existingTeacherIndex = newTeachers.findIndex(
          (newTeacher: User) => {
            return newTeacher.id === oldTeacher.userId;
          }
        );

        if (existingTeacherIndex >= 0) {
          // If yes, nothing needs to be done. Just remove oldTeacher from the
          // newTeachers array because it doesn't need to be considered further.
          newTeachers.splice(existingTeacherIndex, 1);
        } else {
          // If not, oldTeacher needs to be removed from the database.
          await oldTeacher.destroy({transaction: t});
        }
      }

      // Add teachers who are in the newTeachers array but not in the database.

      if (newTeachers.length > 0) {
        await TeacherInCharge.bulkCreate(
          newTeachers.map(teacher => ({
            userId: teacher.id,
            courseId: course.id,
          })),
          {transaction: t}
        );
      }
    }
  });

  if (newAssistants) {
    await CourseRole.updateCourseAssistants(newAssistants, course.id);
  }

  res.sendStatus(HttpCode.Ok);
};
