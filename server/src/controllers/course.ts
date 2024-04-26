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
  EditCourseData,
  HttpCode,
  Language,
} from '@common/types';
import {sequelize} from '../database';
import Course from '../database/models/course';
import CourseRole from '../database/models/courseRole';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';
import {ApiError, CourseFull} from '../types';
import {
  findAndValidateCourseId,
  findCourseFullById,
  parseCourseFull,
  validateCourseId,
  validateEmailList,
} from './utils/course';

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
  const courses = (await Course.findAll({
    include: [{model: CourseTranslation}, {model: User, as: 'Users'}],
  })) as CourseFull[];

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
  const assistants = await validateEmailList(req.body.assistants);

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

    // Add teacher and assistant roles
    const teacherRoles: CourseRole[] = teachers.map(
      teacher =>
        ({
          courseId: newCourse.id,
          userId: teacher.id,
          role: CourseRoleType.Teacher,
        }) as CourseRole
    );
    const assistantRoles: CourseRole[] = assistants.map(
      assistant =>
        ({
          courseId: newCourse.id,
          userId: assistant.id,
          role: CourseRoleType.Assistant,
        }) as CourseRole
    );
    await CourseRole.bulkCreate([...teacherRoles, ...assistantRoles], {
      transaction: t,
    });

    return newCourse;
  });

  res.status(HttpCode.Created).json(course.id);
};

export const editCourse = async (
  req: Request<ParamsDictionary, unknown, EditCourseData>,
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

  const newAssistants: User[] | null =
    assistants !== undefined ? await validateEmailList(assistants) : null;

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
  });

  if (newTeachers !== null || newAssistants !== null) {
    await CourseRole.updateCourseRoles(newTeachers, newAssistants, course.id);
  }

  res.sendStatus(HttpCode.Ok);
};
