// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ForeignKeyConstraintError} from 'sequelize';
import {z} from 'zod';

import {
  AplusCourseData,
  AplusExerciseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
  IdSchema,
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
  Endpoint,
} from '../types';

/**
 * () => AplusCourseData[]
 *
 * @throws ApiError(502)
 */
export const fetchAplusCourses: Endpoint<void, AplusCourseData[]> = async (
  req,
  res
) => {
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
 * () => AplusExerciseData
 *
 * @throws ApiError(400|502)
 */
export const fetchAplusExerciseData: Endpoint<void, AplusExerciseData> = async (
  req,
  res
) => {
  const aplusToken = parseAplusToken(req);
  const aplusCourseId = validateAplusCourseId(req.params.aplusCourseId);

  const exercisesRes = await fetchFromAplus<AplusExercisesRes>(
    `${APLUS_API_URL}/courses/${aplusCourseId}/exercises?format=json`,
    aplusToken
  );

  // Map from exercise IDs to difficulties
  const exerciseDifficulties: {[key: number]: string | null} = {};

  // There doesn't appear to be a better way to get difficulties
  const difficulties = new Set<string>();
  for (const module of exercisesRes.data.results) {
    for (const exercise of module.exercises) {
      if (exercise.difficulty) {
        difficulties.add(exercise.difficulty);
        exerciseDifficulties[exercise.id] = exercise.difficulty;
      } else {
        exerciseDifficulties[exercise.id] = null;
      }
    }
  }

  const exerciseData: AplusExerciseData = {
    maxGrade: 0,
    modules: exercisesRes.data.results.map(module => ({
      id: module.id,
      name: module.display_name,
      closingDate: module.closing_time,
      maxGrade: 0,
      exercises: module.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.display_name,
        maxGrade: exercise.max_points,
      })),
    })),
    difficulties: Array.from(difficulties).map(difficulty => ({
      difficulty,
      maxGrade: 0,
    })),
  };

  for (const module of exerciseData.modules) {
    for (const exercise of module.exercises) {
      exerciseData.maxGrade += exercise.maxGrade;
      module.maxGrade += exercise.maxGrade;

      const difficulty = exerciseData.difficulties.find(
        d => d.difficulty === exerciseDifficulties[exercise.id]
      );
      if (difficulty) {
        difficulty.maxGrade += exercise.maxGrade;
      }
    }
  }

  res.json(exerciseData);
};

/**
 * (NewAplusGradeSourceData[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const addAplusGradeSources: Endpoint<
  NewAplusGradeSourceData[],
  void
> = async (req, res) => {
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

/**
 * () => void
 *
 * @throws ApiError(400|404|409)
 */
export const deleteAplusGradeSource: Endpoint<void, void> = async (
  req,
  res
) => {
  const [_, aplusGradeSource] = await validateAplusGradeSourcePath(
    req.params.courseId,
    req.params.aplusGradeSourceId
  );

  try {
    await aplusGradeSource.destroy();
  } catch (error) {
    if (
      error instanceof ForeignKeyConstraintError &&
      error.index === 'attainment_grade_aplus_grade_source_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete an A+ grade source with grades',
        HttpCode.Conflict
      );
    }

    throw error;
  }

  res.sendStatus(HttpCode.Ok);
};

/**
 * () => NewGrade[]
 *
 * @throws ApiError(400|404|409|502)
 */
export const fetchAplusGrades: Endpoint<void, NewGrade[]> = async (
  req,
  res
) => {
  const aplusToken = parseAplusToken(req);
  let coursePartIds: number[] = [];

  try {
    coursePartIds = z
      .array(IdSchema)
      .parse(JSON.parse(String(req.query['course-parts'])));
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, HttpCode.BadRequest);
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
