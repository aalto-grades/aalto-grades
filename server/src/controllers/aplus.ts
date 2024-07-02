// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {z} from 'zod';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AplusCourseData,
  AplusExerciseData,
  AplusGradeSourceType,
  HttpCode,
  IdSchema,
  NewAplusGradeSourceArraySchema,
  NewAplusGradeSourceData,
  NewGrade,
} from '@/common/types';
import {
  fetchFromAplus,
  parseAplusToken,
  validateAplusCourseId,
} from './utils/aplus';
import {validateCoursePartPath} from './utils/coursePart';
import {APLUS_API_URL} from '../configs/environment';
import AplusGradeSource from '../database/models/aplusGradeSource';
import {ApiError} from '../types';

/**
 * Responds with AplusCourseData[]
 *
 * @throws ApiError(502)
 */
export const fetchAplusCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const aplusToken = parseAplusToken(req);
  const coursesRes = await fetchFromAplus<{
    staff_courses: {
      id: number;
      code: string;
      name: string;
      instance_name: string;
      html_url: string;
    }[];
  }>(`${APLUS_API_URL}/users/me`, aplusToken);

  const staffCourses = coursesRes.data.staff_courses;
  if (staffCourses.length === 0) {
    throw new ApiError('no staff courses found in A+', HttpCode.NotFound);
  }

  const courses: AplusCourseData[] = staffCourses.map(course => ({
    id: course.id,
    courseCode: course.code,
    name: course.name,
    instance: course.instance_name,
    url: course.html_url,
  }));

  res.json(courses);
};

/**
 * Responds with AplusExerciseData
 *
 * @throws ApiError(400|502)
 */
export const fetchAplusExerciseData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const aplusToken = parseAplusToken(req);
  const aplusCourseId = validateAplusCourseId(req.params.aplusCourseId);

  const exercisesRes = await fetchFromAplus<{
    results: {
      id: number;
      display_name: string;
      exercises: {
        id: number;
        display_name: string;
        difficulty: string;
      }[];
    }[];
  }>(
    `${APLUS_API_URL}/courses/${aplusCourseId}/exercises?format=json`,
    aplusToken
  );

  // There doesn't appear to be a better way to get difficulties
  const difficulties = new Set<string>();
  for (const module of exercisesRes.data.results) {
    for (const exercise of module.exercises) {
      if (exercise.difficulty) {
        difficulties.add(exercise.difficulty);
      }
    }
  }

  const exerciseData: AplusExerciseData = {
    modules: exercisesRes.data.results.map(module => ({
      id: module.id,
      name: module.display_name,
      exercises: module.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.display_name,
      })),
    })),
    difficulties: Array.from(difficulties),
  };

  res.json(exerciseData);
};

/** @throws ApiError(400|404|409) */
export const addAplusGradeSources = async (
  req: TypedRequestBody<typeof NewAplusGradeSourceArraySchema>,
  res: Response
): Promise<void> => {
  const newGradeSources: NewAplusGradeSourceData[] = req.body;
  for (const newGradeSource of newGradeSources) {
    await validateCoursePartPath(
      req.params.courseId,
      String(newGradeSource.coursePartId)
    );
  }

  await AplusGradeSource.bulkCreate(newGradeSources);

  res.sendStatus(HttpCode.Created);
};

/**
 * Responds with NewGrade[]
 *
 * @throws ApiError(400|404|409|422|502)
 */
export const fetchAplusGrades = async (
  req: Request,
  res: Response
): Promise<void> => {
  const aplusToken = parseAplusToken(req);
  let coursePartIds: number[] = [];

  try {
    coursePartIds = z
      .array(IdSchema)
      .parse(JSON.parse(String(req.query['course-parts'])));
  } catch (e) {
    if (e instanceof Error) {
      throw new ApiError(e.message, HttpCode.BadRequest);
    }
  }

  type StudentPoints = {
    student_id: string;
    points: number;
    points_by_difficulty: {
      [key: string]: number;
    };
    modules: {
      id: number;
      points: number;
      exercises: {
        id: number;
        points: number;
      }[];
    }[];
  };

  /*
   * Grade sources may point to the same or different courses in A+, so we will
   * fetch the points for each A+ course only once.
   *
   * A+ course ID -> points result
   */
  const pointsResCache: {[key: number]: StudentPoints[]} = {};

  const newGrades: NewGrade[] = [];
  for (const coursePartId of coursePartIds) {
    const [, coursePart] = await validateCoursePartPath(
      req.params.courseId,
      String(coursePartId)
    );

    // TODO: There can be multiple sources
    const gradeSource = await AplusGradeSource.findOne({
      where: {coursePartId: coursePart.id},
    });

    if (!gradeSource) {
      throw new ApiError(
        `Course part with ID ${coursePart.id} has no A+ grade sources`,
        HttpCode.NotFound
      );
    }

    const aplusCourseId = gradeSource.aplusCourse.id;

    if (!(aplusCourseId in pointsResCache)) {
      const pointsRes = await fetchFromAplus<{
        results: StudentPoints[];
      }>(
        `${APLUS_API_URL}/courses/${aplusCourseId}/points?format=json`,
        aplusToken
      );

      pointsResCache[aplusCourseId] = pointsRes.data.results;
    }

    const points = pointsResCache[aplusCourseId];
    for (const student of points) {
      let grade: number | undefined;
      switch (gradeSource.sourceType) {
        case AplusGradeSourceType.FullPoints:
          grade = student.points;
          break;

        case AplusGradeSourceType.Module:
          if (!gradeSource.moduleId) {
            throw new ApiError(
              `grade source with ID ${gradeSource.id} has module type but does not define moduleId`,
              HttpCode.InternalServerError
            );
          }
          for (const module of student.modules) {
            if (module.id === gradeSource.moduleId) {
              grade = module.points;
            }
          }
          if (!grade) {
            throw new ApiError(
              `A+ course with ID ${aplusCourseId} has no module with ID ${gradeSource.moduleId}`,
              HttpCode.InternalServerError
            );
          }
          break;

        case AplusGradeSourceType.Exercise:
          if (!gradeSource.exerciseId) {
            throw new ApiError(
              `grade source with ID ${gradeSource.id} has exercise type but does not define exerciseId`,
              HttpCode.InternalServerError
            );
          }
          for (const module of student.modules) {
            for (const exercise of module.exercises) {
              if (exercise.id === gradeSource.exerciseId) {
                grade = exercise.points;
              }
            }
          }
          if (!grade) {
            throw new ApiError(
              `A+ course with ID ${aplusCourseId} has no exercise with ID ${gradeSource.exerciseId}`,
              HttpCode.InternalServerError
            );
          }
          break;

        case AplusGradeSourceType.Difficulty:
          if (!gradeSource.difficulty) {
            throw new ApiError(
              `grade source with ID ${gradeSource.id} has difficulty type but does not define difficulty`,
              HttpCode.InternalServerError
            );
          }
          if (!(gradeSource.difficulty in student.points_by_difficulty)) {
            throw new ApiError(
              `A+ course with ID ${aplusCourseId} has no difficulty ${gradeSource.difficulty}`,
              HttpCode.InternalServerError
            );
          }
          grade = student.points_by_difficulty[gradeSource.difficulty];
          break;
      }

      // TODO: Proper dates
      // Related: https://github.com/apluslms/a-plus/issues/1361
      const date = new Date();
      const expiryDate = new Date(date);
      expiryDate.setDate(date.getDate() + coursePart.daysValid);

      newGrades.push({
        studentNumber: student.student_id,
        coursePartId: coursePart.id,
        aplusGradeSourceId: gradeSource.id,
        grade: grade,
        date: date,
        expiryDate: expiryDate,
        comment: null,
      });
    }
  }

  res.json(newGrades);
};
