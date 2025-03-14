// SPDX-FileCopyrightText: 2022 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type Transaction, UniqueConstraintError} from 'sequelize';

import {
  type CourseData,
  CourseRoleType,
  type EditCourseData,
  HttpCode,
  Language,
  type NewCourseData,
} from '@/common/types';
import {sequelize} from '../database';
import Course from '../database/models/course';
import CourseRole from '../database/models/courseRole';
import CourseTranslation from '../database/models/courseTranslation';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {
  ApiError,
  type CourseFull,
  type Endpoint,
  type NewDbCourseRole,
} from '../types';
import {
  findAndValidateCourseId,
  findCourseFullById,
  parseCourseFull,
  validateCourseId,
  validateEmailList,
  validateRoleUniqueness,
} from './utils/course';

/**
 * () => CourseData
 *
 * @throws ApiError(400|404)
 */
export const getCourse: Endpoint<void, CourseData> = async (req, res) => {
  const courseId = await validateCourseId(req.params.courseId);
  const courseData = parseCourseFull(await findCourseFullById(courseId));
  res.json(courseData);
};

/** () => CourseData[] */
export const getAllCourses: Endpoint<void, CourseData[]> = async (
  _req,
  res
) => {
  const courses = (await Course.findAll({
    include: [{model: CourseTranslation}, {model: User, as: 'Users'}],
  })) as CourseFull[];

  const coursesData = [];
  for (const course of courses) {
    coursesData.push(parseCourseFull(course));
  }

  res.json(coursesData);
};

/**
 * (NewCourseData) => number
 *
 * @throws ApiError(404|409|422)
 */
export const addCourse: Endpoint<NewCourseData, number> = async (req, res) => {
  const teachers = await validateEmailList(req.body.teachersInCharge);
  const assistants = await validateEmailList(
    req.body.assistants.map(assistant => assistant.email)
  );

  validateRoleUniqueness(teachers, assistants);

  const course = await sequelize.transaction(async (t): Promise<Course> => {
    const [newCourse, created] = await Course.findOrCreate({
      where: {
        courseCode: req.body.courseCode,
      },
      defaults: {
        courseCode: req.body.courseCode,
        department: req.body.department,
        minCredits: req.body.minCredits,
        maxCredits: req.body.maxCredits,
        gradingScale: req.body.gradingScale,
        languageOfInstruction: req.body.languageOfInstruction,
      },
      transaction: t,
    });

    if (!created) {
      await t.rollback();
      throw new ApiError(
        `Course with course code ${req.body.courseCode} already exists`,
        HttpCode.Conflict
      );
    }

    await CourseTranslation.bulkCreate(
      [
        {
          courseId: newCourse.id,
          language: Language.Finnish,
          courseName: req.body.name.fi,
        },
        {
          courseId: newCourse.id,
          language: Language.English,
          courseName: req.body.name.en,
        },
        {
          courseId: newCourse.id,
          language: Language.Swedish,
          courseName: req.body.name.sv,
        },
      ],
      {transaction: t}
    );

    // Add teacher and assistant roles
    const teacherRoles: NewDbCourseRole[] = teachers.map(teacher => ({
      courseId: newCourse.id,
      userId: teacher.id,
      role: CourseRoleType.Teacher,
    }));
    const assistantRoles: NewDbCourseRole[] = assistants.map(assistant => {
      const assistantExpiryDate = req.body.assistants.find(
        reqAssistant => reqAssistant.email === assistant.email
      )?.expiryDate;
      return {
        courseId: newCourse.id,
        userId: assistant.id,
        role: CourseRoleType.Assistant,
        expiryDate: assistantExpiryDate,
      };
    });
    await CourseRole.bulkCreate([...teacherRoles, ...assistantRoles], {
      transaction: t,
    });

    return newCourse;
  });

  res.status(HttpCode.Created).json(course.id);
};

/**
 * (EditCourseData) => void
 *
 * @throws ApiError(400|404|409|422)
 */
export const editCourse: Endpoint<EditCourseData, void> = async (req, res) => {
  const course = await findAndValidateCourseId(req.params.courseId);
  const finalGrade = await FinalGrade.findOne({where: {courseId: course.id}});

  const {
    courseCode,
    department,
    minCredits,
    maxCredits,
    gradingScale,
    languageOfInstruction,
    name,
    teachersInCharge,
    assistants,
  } = req.body;

  if (finalGrade !== null && gradingScale !== course.gradingScale) {
    throw new ApiError(
      'Cannot change grading scale of a course with final grades',
      HttpCode.BadRequest
    );
  }

  // Get old and new teachers & assistants
  const oldTeachers = await CourseRole.findAll({
    where: {courseId: course.id, role: CourseRoleType.Teacher},
  });
  const oldAssistants = await CourseRole.findAll({
    where: {courseId: course.id, role: CourseRoleType.Assistant},
  });
  const newTeachers =
    teachersInCharge !== undefined
      ? await validateEmailList(teachersInCharge)
      : null;
  const newAssistants =
    assistants !== undefined
      ? await validateEmailList(assistants.map(assistant => assistant.email))
      : null;

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

  await sequelize.transaction(async (t: Transaction): Promise<void> => {
    try {
      await Course.update(
        {
          courseCode: courseCode ?? course.courseCode,
          department: department ?? course.department,
          minCredits: minCredits ?? course.minCredits,
          maxCredits: maxCredits ?? course.maxCredits,
          gradingScale: gradingScale ?? course.gradingScale,
          languageOfInstruction:
            languageOfInstruction ?? course.languageOfInstruction,
        },
        {
          where: {id: course.id},
          transaction: t,
        }
      );
    } catch (error) {
      await t.rollback();
      // Duplicate name error
      if (error instanceof UniqueConstraintError) {
        throw new ApiError(
          `Course with course code ${courseCode} already exists`,
          HttpCode.Conflict
        );
      }
      // Other error
      throw error;
    }

    const updateTranslation = async (
      language: Language,
      key: 'en' | 'fi' | 'sv'
    ): Promise<void> => {
      await CourseTranslation.update(
        {courseName: name ? name[key] : undefined},
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
    validateRoleUniqueness(
      newTeachers ?? oldTeachers,
      newAssistants ?? oldAssistants
    );
    const teacherRoles: NewDbCourseRole[] | null =
      newTeachers !== null
        ? newTeachers.map(teacher => ({
            courseId: course.id,
            userId: teacher.id,
            role: CourseRoleType.Teacher,
          }))
        : null;
    const assistantRoles: NewDbCourseRole[] | null =
      newAssistants !== null
        ? newAssistants.map(assistant => {
            const assistantExpiryDate = assistants?.find(
              reqAssistant => reqAssistant.email === assistant.email
            )?.expiryDate;
            return {
              courseId: course.id,
              userId: assistant.id,
              role: CourseRoleType.Assistant,
              expiryDate: assistantExpiryDate,
            };
          })
        : null;
    await CourseRole.updateCourseRoles(teacherRoles, assistantRoles, course.id);
  }

  res.sendStatus(HttpCode.Ok);
};
