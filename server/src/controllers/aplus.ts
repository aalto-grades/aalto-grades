// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ForeignKeyConstraintError} from 'sequelize';
import {z} from 'zod';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AplusCourseData,
  AplusExerciseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
  IdSchema,
  NewAplusGradeSourceArraySchema,
  NewAplusGradeSourceData,
  NewGrade,
} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util/aplus';
import {
  fetchFromAplus,
  parseAplusGradeSource,
  parseAplusToken,
  validateAplusCourseId,
  validateAplusGradeSourcePath,
} from './utils/aplus';
import {validateCoursePartPath} from './utils/coursePart';
import {APLUS_API_URL} from '../configs/environment';
import AplusGradeSource from '../database/models/aplusGradeSource';
import {
  ApiError,
  AplusCoursesRes,
  AplusExercisesRes,
  AplusPointsRes,
  AplusStudentPoints,
} from '../types';

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
  const coursesRes = await fetchFromAplus<AplusCoursesRes>(
    `${APLUS_API_URL}/users/me`,
    aplusToken
  );

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

  const exercisesRes = await fetchFromAplus<AplusExercisesRes>(
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
      closingDate: module.closing_time,
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
  const partGradeSourcesById: {[key: number]: AplusGradeSource[]} = {};
  const newGradeSources: NewAplusGradeSourceData[] = req.body;

  for (const newGradeSource of newGradeSources) {
    const [_, coursePart] = await validateCoursePartPath(
      req.params.courseId,
      String(newGradeSource.coursePartId)
    );

    for (const other of newGradeSources.filter(
      source => source !== newGradeSource
    )) {
      if (aplusGradeSourcesEqual(newGradeSource, other)) {
        throw new ApiError(
          `attempted to add the same A+ grade source ${JSON.stringify(newGradeSource)} twice`,
          HttpCode.Conflict
        );
      }
    }

    if (!(coursePart.id in partGradeSourcesById)) {
      partGradeSourcesById[coursePart.id] = await AplusGradeSource.findAll({
        where: {coursePartId: coursePart.id},
      });
    }

    for (const partGradeSource of partGradeSourcesById[coursePart.id]) {
      const parsed = parseAplusGradeSource(partGradeSource);
      if (aplusGradeSourcesEqual(newGradeSource, parsed)) {
        throw new ApiError(
          `course part with ID ${partGradeSource.coursePartId} ` +
            `already has the A+ grade source ${JSON.stringify(newGradeSource)}`,
          HttpCode.Conflict
        );
      }
    }
  }

  await AplusGradeSource.bulkCreate(newGradeSources);

  res.sendStatus(HttpCode.Created);
};

/** @throws ApiError(400|404|409) */
export const deleteAplusGradeSource = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [_, aplusGradeSource] = await validateAplusGradeSourcePath(
    req.params.courseId,
    req.params.aplusGradeSourceId
  );

  try {
    await aplusGradeSource.destroy();
  } catch (e) {
    if (
      e instanceof ForeignKeyConstraintError &&
      e.index === 'attainment_grade_aplus_grade_source_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete an A+ grade source with grades',
        HttpCode.Conflict
      );
    }

    throw e;
  }

  res.sendStatus(HttpCode.Ok);
};

/**
 * Responds with NewGrade[]
 *
 * @throws ApiError(400|404|409|502)
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

  /*
   * Grade sources may point to the same or different courses in A+, so we will
   * fetch the points for each A+ course only once.
   *
   * A+ course ID -> points result
   */
  const pointsResCache: {[key: number]: AplusStudentPoints[]} = {};

  const newGrades: NewGrade[] = [];
  for (const coursePartId of coursePartIds) {
    const [, coursePart] = await validateCoursePartPath(
      req.params.courseId,
      String(coursePartId)
    );

    const gradeSources = (await AplusGradeSource.findAll({
      where: {coursePartId: coursePart.id},
    })) as AplusGradeSourceData[];

    if (gradeSources.length === 0) {
      throw new ApiError(
        `Course part with ID ${coursePart.id} has no A+ grade sources`,
        HttpCode.NotFound
      );
    }

    for (const gradeSource of gradeSources) {
      const aplusCourseId = gradeSource.aplusCourse.id;

      if (!(aplusCourseId in pointsResCache)) {
        const pointsRes = await fetchFromAplus<AplusPointsRes>(
          `${APLUS_API_URL}/courses/${aplusCourseId}/points?format=json`,
          aplusToken
        );

        pointsResCache[aplusCourseId] = pointsRes.data.results;
      }

      const points = pointsResCache[aplusCourseId];
      for (const student of points) {
        // TODO: https://github.com/aalto-grades/base-repository/issues/747
        if (!student.student_id) {
          continue;
        }

        let grade: number | null = null;
        switch (gradeSource.sourceType) {
          case AplusGradeSourceType.FullPoints:
            grade = student.points;
            break;

          case AplusGradeSourceType.Module:
            for (const module of student.modules) {
              if (module.id === gradeSource.moduleId) {
                grade = module.points;
                break;
              }
            }
            if (grade === null) {
              throw new ApiError(
                `A+ course with ID ${aplusCourseId} has no module with ID ${gradeSource.moduleId}`,
                HttpCode.InternalServerError
              );
            }
            break;

          case AplusGradeSourceType.Exercise:
            for (const module of student.modules) {
              for (const exercise of module.exercises) {
                if (exercise.id === gradeSource.exerciseId) {
                  grade = exercise.points;
                }
              }
            }
            if (grade === null) {
              throw new ApiError(
                `A+ course with ID ${aplusCourseId} has no exercise with ID ${gradeSource.exerciseId}`,
                HttpCode.InternalServerError
              );
            }
            break;

          case AplusGradeSourceType.Difficulty:
            grade = student.points_by_difficulty[gradeSource.difficulty] ?? 0;
            break;
        }

        const date = new Date(gradeSource.date);
        const expiryDate = new Date(gradeSource.date);
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
  }

  res.json(newGrades);
};
