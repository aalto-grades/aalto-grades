// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ForeignKeyConstraintError} from 'sequelize';
import {z} from 'zod';

import {
  type AplusCourseData,
  type AplusExerciseData,
  type AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
  IdSchema,
  type NewAplusGradeSourceData,
  type NewTaskGrade,
} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util';
import {APLUS_API_URL} from '../configs/environment';
import AplusGradeSource from '../database/models/aplusGradeSource';
import {
  ApiError,
  AplusCoursesResSchema,
  AplusExercisesResSchema,
  AplusPointsResSchema,
  type AplusStudentPoints,
  type Endpoint,
} from '../types';
import {
  fetchFromAplus,
  parseAplusGradeSource,
  parseAplusToken,
  validateAplusCourseId,
  validateAplusGradeSourcePath,
} from './utils/aplus';
import {validateCourseTaskPath} from './utils/courseTask';

/**
 * () => AplusCourseData[]
 *
 * @throws ApiError(404|502)
 */
export const fetchAplusCourses: Endpoint<void, AplusCourseData[]> = async (
  req,
  res
) => {
  const aplusToken = parseAplusToken(req);
  const coursesRes = await fetchFromAplus(
    `${APLUS_API_URL}/users/me`,
    aplusToken,
    AplusCoursesResSchema
  );

  const staffCourses = coursesRes.staff_courses;
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

  const exercisesRes = await fetchFromAplus(
    `${APLUS_API_URL}/courses/${aplusCourseId}/exercises?format=json`,
    aplusToken,
    AplusExercisesResSchema
  );

  // Map from exercise IDs to difficulties
  const exerciseDifficulties: {[key: number]: string | null} = {};

  // There doesn't appear to be a better way to get difficulties
  const difficulties = new Set<string>();
  for (const module of exercisesRes.results) {
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
    modules: exercisesRes.results.map(module => ({
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
  const taskGradeSourcesById: {[key: number]: AplusGradeSource[]} = {};
  const newGradeSources: NewAplusGradeSourceData[] = req.body;

  // Validate new grade sources
  for (const newGradeSource of newGradeSources) {
    const [, , courseTask] = await validateCourseTaskPath(
      req.params.courseId,
      String(newGradeSource.courseTaskId)
    );

    const duplicate = newGradeSources.some(
      source =>
        source !== newGradeSource &&
        aplusGradeSourcesEqual(newGradeSource, source)
    );
    if (duplicate) {
      throw new ApiError(
        `attempted to add the same A+ grade source ${JSON.stringify(newGradeSource)} twice`,
        HttpCode.Conflict
      );
    }

    if (!(courseTask.id in taskGradeSourcesById)) {
      taskGradeSourcesById[courseTask.id] = await AplusGradeSource.findAll({
        where: {courseTaskId: courseTask.id},
      });
    }

    const existing = taskGradeSourcesById[courseTask.id].find(taskGradeSource =>
      aplusGradeSourcesEqual(
        newGradeSource,
        parseAplusGradeSource(taskGradeSource)
      )
    );
    if (existing !== undefined) {
      throw new ApiError(
        `course task with ID ${existing.courseTaskId} ` +
          `already has the A+ grade source ${JSON.stringify(existing)}`,
        HttpCode.Conflict
      );
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
      error.index === 'task_grade_aplus_grade_source_id_fkey'
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
 * () => NewTaskGrade[]
 *
 * @throws ApiError(400|404|409|502)
 */
export const fetchAplusGrades: Endpoint<void, NewTaskGrade[]> = async (
  req,
  res
) => {
  const aplusToken = parseAplusToken(req);
  let courseTaskIds: number[] = [];

  try {
    courseTaskIds = z
      .array(IdSchema)
      // .parse(JSON.parse(String(req.query['course-tasks']))); // This line was giving a typescript error
      .parse(JSON.parse(JSON.stringify(req.query['course-tasks'])));
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

  const newGrades: NewTaskGrade[] = [];
  for (const courseTaskId of courseTaskIds) {
    const [, , courseTask] = await validateCourseTaskPath(
      req.params.courseId,
      String(courseTaskId)
    );

    const gradeSources = (await AplusGradeSource.findAll({
      where: {courseTaskId: courseTask.id},
    })) as AplusGradeSourceData[];

    if (gradeSources.length === 0) {
      throw new ApiError(
        `Course task with ID ${courseTask.id} has no A+ grade sources`,
        HttpCode.NotFound
      );
    }

    for (const gradeSource of gradeSources) {
      const aplusCourseId = gradeSource.aplusCourse.id;

      if (!(aplusCourseId in pointsResCache)) {
        const pointsRes = await fetchFromAplus(
          `${APLUS_API_URL}/courses/${aplusCourseId}/points?format=json`,
          aplusToken,
          AplusPointsResSchema
        );

        pointsResCache[aplusCourseId] = pointsRes.results;
      }

      const points = pointsResCache[aplusCourseId];
      for (const student of points) {
        // TODO: Handle students without student number (#747)
        if (!student.student_id) {
          continue;
        }

        let grade: number | null = null;
        switch (gradeSource.sourceType) {
          case AplusGradeSourceType.FullPoints:
            grade = student.points;
            break;

          case AplusGradeSourceType.Module: {
            const module = student.modules.find(
              mod => mod.id === gradeSource.moduleId
            );
            if (module === undefined) {
              throw new ApiError(
                `A+ course with ID ${aplusCourseId} has no module with ID ${gradeSource.moduleId}`,
                HttpCode.InternalServerError
              );
            }
            grade = module.points;
            break;
          }

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
        expiryDate.setDate(date.getDate() + (courseTask.daysValid ?? 0));

        newGrades.push({
          studentNumber: student.student_id,
          courseTaskId: courseTask.id,
          aplusGradeSourceId: gradeSource.id,
          grade: grade,
          date: date,
          expiryDate: courseTask.daysValid !== null ? expiryDate : null,
          comment: null,
        });
      }
    }
  }

  res.json(newGrades);
};
