// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CourseData,
  GradingScale,
  HttpCode,
  Language,
  LocalizedString,
  UserData,
} from '@common/types';
import {Request, Response} from 'express';
import {Transaction} from 'sequelize';
import * as yup from 'yup';

import {sequelize} from '../database';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import TeacherInCharge from '../database/models/teacherInCharge';
import User from '../database/models/user';

import {ApiError, CourseFull, idSchema, localizedStringSchema} from '../types';
import {
  findCourseById,
  findCourseFullById,
  parseCourseFull,
} from './utils/course';

export async function getCourse(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({id: courseId});

  res.status(HttpCode.Ok).json({
    data: parseCourseFull(
      await findCourseFullById(courseId, HttpCode.NotFound)
    ),
  });
}

export async function getAllCourses(
  _req: Request,
  res: Response
): Promise<void> {
  const courses: Array<CourseFull> = (await Course.findAll({
    include: [
      {
        model: CourseTranslation,
      },
      {
        model: User,
      },
    ],
  })) as Array<CourseFull>;

  const coursesData: Array<CourseData> = [];

  for (const course of courses) {
    coursesData.push(parseCourseFull(course));
  }

  res.status(HttpCode.Ok).json({
    data: coursesData,
  });
}

async function validateEmailList(
  emailList: Array<string>
): Promise<Array<User>> {
  const teachers: Array<User> = await User.findAll({
    attributes: ['id', 'email'],
    where: {
      email: emailList,
    },
  });

  // Check for non existent emails.
  if (emailList.length !== teachers.length) {
    const missingEmails: Array<string> = emailList.filter((teacher: string) => {
      return teachers.map((user: User) => user.email).indexOf(teacher) === -1;
    });

    throw new ApiError(
      missingEmails.map((email: string) => {
        return `No user with email address ${email} found`;
      }),
      HttpCode.UnprocessableEntity
    );
  }

  return teachers;
}

export async function addCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().required(),
    minCredits: yup.number().min(0).required(),
    maxCredits: yup.number().min(yup.ref('minCredits')).required(),
    gradingScale: yup.string().oneOf(Object.values(GradingScale)).required(),
    languageOfInstruction: yup
      .string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toUpperCase() : value;
      })
      .oneOf(Object.values(Language))
      .required(),
    teachersInCharge: yup
      .array()
      .of(
        yup.object().shape({
          email: yup.string().email().required(),
        })
      )
      .required(),
    department: localizedStringSchema.required(),
    name: localizedStringSchema.required(),
  });

  await requestSchema.validate(req.body, {abortEarly: false});

  const teachers: Array<User> = await validateEmailList(
    req.body.teachersInCharge.map((teacher: UserData) => teacher.email)
  );

  const course: Course = await sequelize.transaction(
    async (t: Transaction): Promise<Course> => {
      const course: Course = await Course.create(
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
            courseId: course.id,
            language: Language.Finnish,
            department: req.body.department.fi ?? '',
            courseName: req.body.name.fi ?? '',
          },
          {
            courseId: course.id,
            language: Language.English,
            department: req.body.department.en ?? '',
            courseName: req.body.name.en ?? '',
          },
          {
            courseId: course.id,
            language: Language.Swedish,
            department: req.body.department.sv ?? '',
            courseName: req.body.name.sv ?? '',
          },
        ],
        {transaction: t}
      );

      const teachersInCharge: Array<TeacherInCharge> = teachers.map(
        (teacher: User) => {
          return {
            courseId: course.id,
            userId: teacher.id,
          };
        }
      ) as Array<TeacherInCharge>;

      await TeacherInCharge.bulkCreate(teachersInCharge, {transaction: t});

      return course;
    }
  );

  res.status(HttpCode.Ok).json({
    data: course.id,
  });
}

export async function editCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().notRequired(),
    minCredits: yup.number().min(0).notRequired(),
    maxCredits: yup.number().min(yup.ref('minCredits')).notRequired(),
    gradingScale: yup.string().oneOf(Object.values(GradingScale)).notRequired(),
    languageOfInstruction: yup
      .string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toUpperCase() : value;
      })
      .oneOf(Object.values(Language))
      .notRequired(),
    teachersInCharge: yup
      .array()
      .of(
        yup.object().shape({
          email: yup.string().email().required(),
        })
      )
      .notRequired(),
    department: localizedStringSchema.notRequired(),
    name: localizedStringSchema.notRequired(),
  });

  await requestSchema.validate(req.body, {abortEarly: false});
  const courseId: number = (await idSchema.validate({id: req.params.courseId}))
    .id;
  const course: Course = await findCourseById(courseId, HttpCode.NotFound);

  const courseCode: string | undefined = req.body.courseCode;
  const minCredits: number | undefined = req.body.minCredits;
  const maxCredits: number | undefined = req.body.maxCredits;
  const gradingScale: GradingScale | undefined = req.body.gradingScale;
  const teachersInCharge: Array<UserData> | undefined =
    req.body.teachersInCharge;
  const department: LocalizedString | undefined = req.body.department;
  const name: LocalizedString | undefined = req.body.name;
  const languageOfInstruction: Language | undefined = req.body
    .languageOfInstruction
    ? req.body.languageOfInstruction.toUpperCase()
    : undefined;

  if (minCredits && !maxCredits && minCredits > course.maxCredits) {
    throw new ApiError(
      `without updating max credits, new min credits (${minCredits}) can't be` +
        ` larger than existing max credits (${course.maxCredits})`,
      HttpCode.BadRequest
    );
  } else if (maxCredits && !minCredits && maxCredits < course.minCredits) {
    throw new ApiError(
      `without updating min credits, new max credits (${maxCredits}) can't be` +
        ` smaller than existing min credits (${course.minCredits})`,
      HttpCode.BadRequest
    );
  }

  const newTeachers: Array<User> | null = teachersInCharge
    ? await validateEmailList(
        // teacher.email was alread validated to be defined by Yup.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        teachersInCharge.map((teacher: UserData) => teacher.email!)
      )
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
        where: {
          id: courseId,
        },
        transaction: t,
      }
    );

    async function updateTranslation(
      language: Language,
      key: 'en' | 'fi' | 'sv'
    ): Promise<void> {
      await CourseTranslation.update(
        {
          department: department ? department[key] : undefined,
          courseName: name ? name[key] : undefined,
        },
        {
          where: {
            courseId: courseId,
            language: language,
          },
          transaction: t,
        }
      );
    }

    await updateTranslation(Language.English, 'en');
    await updateTranslation(Language.Finnish, 'fi');
    await updateTranslation(Language.Swedish, 'sv');

    if (newTeachers) {
      const oldTeachers: Array<TeacherInCharge> = await TeacherInCharge.findAll(
        {
          where: {
            courseId: courseId,
          },
        }
      );

      // Delete teachers who are not in the newTeachers array.
      for (const oldTeacher of oldTeachers) {
        // Does oldTeacher exist in the newTeachers array?
        const existingTeacherIndex: number = newTeachers.findIndex(
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
      if (oldTeachers.length > 0) {
        await TeacherInCharge.bulkCreate(
          newTeachers.map((user: User) => {
            return {
              userId: user.id,
              courseId: courseId,
            };
          }),
          {transaction: t}
        );
      }
    }
  });

  res.status(HttpCode.Ok).json({
    data: parseCourseFull(
      await findCourseFullById(courseId, HttpCode.NotFound)
    ),
  });
}
