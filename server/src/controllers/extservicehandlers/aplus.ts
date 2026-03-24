// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {
  type AplusCourseData,
  type AplusExerciseData,
  ExtServiceCourseDataSchema,
  ExtServiceGradeSourceType,
  HttpCode,
  IdSchema,
  type NewTaskGrade,
} from '@/common/types';
import {
  fetchFromAplus,
  fetchFromAplusPaginated,
  parseAplusToken,
  validateAplusCourseId,
} from './aplusUtils';
import type {ExtServiceHandler} from './types';
import {APLUS_API_URL} from '../../configs/environment';
import CourseTaskExternalSource from '../../database/models/courseTaskExternalSource';
import ExternalSource from '../../database/models/externalSource';
import {
  ApiError,
  AplusCoursesResSchema,
  AplusExercisesResSchema,
  AplusPointsResSchema,
  normalizeStringParam,
} from '../../types';
import {validateCourseTaskPath} from '../utils/courseTask';

const parseCourseTaskIdsFromQuery = (courseTasksQuery: unknown): number[] => {
  if (typeof courseTasksQuery !== 'string') {
    throw new ApiError('Missing query param "course-tasks"', HttpCode.BadRequest);
  }

  try {
    return z.array(IdSchema).parse(JSON.parse(courseTasksQuery));
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, HttpCode.BadRequest);
    }
    throw error;
  }
};

const AplusSourceInfoSchema = z.looseObject({
  sourceType: z.enum(ExtServiceGradeSourceType),
  sourceId: z.number().optional().or(z.string().optional()),
  itemname: z.string().optional(),
  difficulty: z.string().optional(),
  date: z.coerce.date().optional(),
});

const fetchCourses: ExtServiceHandler['fetchCourses'] = async (req) => {
  const aplusToken = parseAplusToken(req);
  const coursesRes = await fetchFromAplus(
    `${APLUS_API_URL}/users/me`,
    aplusToken,
    AplusCoursesResSchema,
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

  return courses;
};

const fetchExerciseData: ExtServiceHandler['fetchExerciseData'] = async (req) => {
  const aplusToken = parseAplusToken(req);
  const aplusCourseId = validateAplusCourseId(
    normalizeStringParam(req.params.serviceCourseId),
  );

  const exercisesRes = await fetchFromAplus(
    `${APLUS_API_URL}/courses/${aplusCourseId}/exercises?format=json`,
    aplusToken,
    AplusExercisesResSchema,
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
  const exerciseArr = [
    {
      id: ExtServiceGradeSourceType.FullPoints,
      name: 'Total',
      items: [{
        id: 0,
        itemname: 'Full Points',
        sourceType: ExtServiceGradeSourceType.FullPoints,
      },],
    },
    {
      id: ExtServiceGradeSourceType.Module,
      name: 'Module',
      items: exerciseData.modules.map(module => ({
        id: module.id,
        itemname: module.name,
        maxGrade: module.maxGrade,
        sourceType: ExtServiceGradeSourceType.Module,
      })),
    },
    {
      id: ExtServiceGradeSourceType.Exercise,
      name: 'Exercise',
      items: exerciseData.modules.flatMap(module => module.exercises.map(exercise => ({
        id: exercise.id,
        itemname: exercise.name,
        maxGrade: exercise.maxGrade,
        sourceType: ExtServiceGradeSourceType.Exercise,
      }))),
    },
    {
      id: ExtServiceGradeSourceType.Difficulty,
      name: 'Difficulty',
      items: exerciseData.difficulties.map(difficulty => ({
        id: difficulty.difficulty,
        itemname: difficulty.difficulty,
        maxGrade: difficulty.maxGrade,
        sourceType: ExtServiceGradeSourceType.Difficulty,
      })),
    },
  ];

  return exerciseArr;
};

const fetchGrades: ExtServiceHandler['fetchGrades'] = async (req) => {
  const aplusToken = parseAplusToken(req);
  const courseTaskIds = parseCourseTaskIdsFromQuery(req.query['course-tasks']);
  const parsedCourseId = normalizeStringParam(req.params.courseId);

  const pointsResCache: {[key: number]: z.output<typeof AplusPointsResSchema>} =
    {};
  const newGrades: NewTaskGrade[] = [];

  for (const courseTaskId of courseTaskIds) {
    const [, , courseTask] = await validateCourseTaskPath(
      parsedCourseId,
      String(courseTaskId),
    );

    const links = await CourseTaskExternalSource.findAll({
      where: {courseTaskId: courseTask.id},
    });

    const linkedSources = (
      await Promise.all(
        links.map(async link => ExternalSource.findByPk(link.externalSourceId)),
      )
    ).filter((source): source is ExternalSource => source !== null);

    const aplusSources = linkedSources.filter(
      source => source.externalServiceName === 'APLUS',
    );

    if (aplusSources.length === 0) {
      throw new ApiError(
        `Course task with ID ${courseTask.id} has no A+ external sources`,
        HttpCode.NotFound,
      );
    }

    for (const source of aplusSources) {
      const courseResult = ExtServiceCourseDataSchema.safeParse(source.externalCourse);
      if (!courseResult.success) {
        throw new ApiError(
          `Invalid external course data for source ${source.id}`,
          HttpCode.InternalServerError,
        );
      }

      const sourceInfoResult = AplusSourceInfoSchema.safeParse(source.sourceInfo);
      if (!sourceInfoResult.success) {
        throw new ApiError(
          `Invalid source info for source ${source.id}: ${sourceInfoResult.error.message}`,
          HttpCode.InternalServerError,
        );
      }

      const sourceInfo = sourceInfoResult.data;
      const aplusCourseId = courseResult.data.id;

      if (!(aplusCourseId in pointsResCache)) {
        pointsResCache[aplusCourseId] = await fetchFromAplusPaginated(
          `${APLUS_API_URL}/courses/${aplusCourseId}/points?format=json`,
          aplusToken,
          AplusPointsResSchema,
        );
      }

      const points = pointsResCache[aplusCourseId];
      for (const student of points) {
        if (!student.student_id) {
          continue;
        }

        let grade: number | null = null;
        switch (sourceInfo.sourceType) {
          case ExtServiceGradeSourceType.FullPoints:
            grade = student.points;
            break;
          case ExtServiceGradeSourceType.Module: {
            const moduleId = sourceInfo.sourceId;
            if (moduleId === undefined) {
              throw new ApiError(
                `A+ source ${source.id} is missing module sourceId`,
                HttpCode.InternalServerError,
              );
            }
            const module = student.modules.find(mod => mod.id === moduleId);
            if (module === undefined) {
              throw new ApiError(
                `A+ course with ID ${aplusCourseId} has no module with ID ${moduleId}`,
                HttpCode.InternalServerError,
              );
            }
            grade = module.points;
            break;
          }
          case ExtServiceGradeSourceType.Exercise: {
            const exerciseId = sourceInfo.sourceId;
            if (exerciseId === undefined) {
              throw new ApiError(
                `A+ source ${source.id} is missing exercise sourceId`,
                HttpCode.InternalServerError,
              );
            }

            for (const module of student.modules) {
              for (const exercise of module.exercises) {
                if (exercise.id === exerciseId) {
                  grade = exercise.points;
                }
              }
            }
            if (grade === null) {
              throw new ApiError(
                `A+ course with ID ${aplusCourseId} has no exercise with ID ${exerciseId}`,
                HttpCode.InternalServerError,
              );
            }
            break;
          }
          case ExtServiceGradeSourceType.Difficulty: {
            const difficulty = sourceInfo.difficulty ?? sourceInfo.itemname;
            if (!difficulty) {
              throw new ApiError(
                `A+ source ${source.id} is missing difficulty`,
                HttpCode.InternalServerError,
              );
            }
            grade = student.points_by_difficulty[difficulty] ?? 0;
            break;
          }
        }

        const date = sourceInfo.date ?? source.createdAt;
        const expiryDate = new Date(date);
        expiryDate.setDate(date.getDate() + (courseTask.daysValid ?? 0));

        newGrades.push({
          studentNumber: student.student_id,
          courseTaskId: courseTask.id,
          externalSourceId: source.id,
          grade,
          date,
          expiryDate: courseTask.daysValid !== null ? expiryDate : null,
          comment: null,
        });
      }
    }
  }

  return newGrades;
};

export const aplusHandler: ExtServiceHandler = {
  externalServiceName: 'APLUS',
  fetchCourses,
  fetchExerciseData,
  fetchGrades,
};
