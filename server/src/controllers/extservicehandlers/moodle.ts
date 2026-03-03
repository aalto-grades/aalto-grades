// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import type {Request} from 'express';
import {z} from 'zod';

import {
  type AplusCourseData,
  ExtServiceCourseDataSchema,
  ExtServiceGradeSourceType,
  HttpCode,
  IdSchema,
  type NewTaskGrade,
} from '@/common/types';
import type {ExtServiceHandler} from './types';
import {AXIOS_TIMEOUT} from '../../configs/constants';
import {MYCOURSES_API_URL} from '../../configs/environment';
import httpLogger from '../../configs/winston';
import CourseTaskExternalSource from '../../database/models/courseTaskExternalSource';
import ExternalSource from '../../database/models/externalSource';
import {
  ApiError,
  MoodleCourseSchema,
  MoodleGradeItemsResponseSchema,
  MoodleSiteInfoSchema,
  MoodleUserGradesResponseSchema,
  normalizeStringParam,
  stringToIdSchema,
} from '../../types';
import {validateCourseTaskPath} from '../utils/courseTask';

const parseAuthToken = (req: Request): string => {
  const auth = req.headers.authorization;
  if (!auth) {
    throw new ApiError('no MyCourses API token provided', HttpCode.BadRequest);
  }

  const authArray = auth.split(' ');
  const result = z
    .tuple([z.literal('mycourses-Token'), z.string()])
    .safeParse(authArray);
  if (!result.success) {
    throw new ApiError(result.error.message, HttpCode.BadRequest);
  }

  return authArray[1];
};

const validateMyCoursesCourseId = (myCoursesCourseId: string): number => {
  const result = stringToIdSchema.safeParse(myCoursesCourseId);
  if (!result.success) {
    throw new ApiError(
      `Invalid MyCourses course ID ${myCoursesCourseId}`,
      HttpCode.BadRequest,
    );
  }
  return result.data;
};

const fetchFromMyCourses = async <T>(
  myCourseToken: string,
  wsFunction: string,
  wsFunctionParams: {[key: string]: string | number | boolean},
  schema: z.ZodType<T>,
): Promise<T> => {
  httpLogger.http(`Calling MyCourses function: ${wsFunction}`);

  const params = new URLSearchParams();
  params.append('wstoken', myCourseToken);
  params.append('wsfunction', wsFunction);
  params.append('moodlewsrestformat', 'json');
  for (const [key, value] of Object.entries(wsFunctionParams)) {
    params.append(key, String(value));
  }

  const queryRes = await axios.get<T>(MYCOURSES_API_URL, {
    params,
    timeout: AXIOS_TIMEOUT,
    validateStatus: (status: number) => status === 200,
  });
  const result = schema.safeParse(queryRes.data);

  if (!result.success) {
    const testError = z
      .looseObject({errorcode: z.string()})
      .safeParse(queryRes.data);
    if (testError.success) {
      throw new ApiError(
        `MyCourses API error: ${JSON.stringify(testError.data)}`,
        HttpCode.BadGateway,
      );
    }
    throw new ApiError(
      `Validating data from MyCourses failed: ${result.error}`,
      HttpCode.BadGateway,
    );
  }

  return result.data;
};

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

const MoodleSourceInfoSchema = z.looseObject({
  sourceType: z.enum(ExtServiceGradeSourceType),
  sourceId: z.union([z.number(), z.string()]).optional(),
  itemname: z.string().optional(),
  date: z.coerce.date().optional(),
});

const fetchCourses: ExtServiceHandler['fetchCourses'] = async (req) => {
  const myCourseToken = parseAuthToken(req);
  const selfInfo = await fetchFromMyCourses(
    myCourseToken,
    'core_webservice_get_site_info',
    {},
    MoodleSiteInfoSchema,
  );
  if (!selfInfo.userid) {
    throw new ApiError('could not get user ID from MyCourses', HttpCode.NotFound);
  }

  const coursesRes = await fetchFromMyCourses(
    myCourseToken,
    'core_enrol_get_users_courses',
    {userid: selfInfo.userid},
    z.array(MoodleCourseSchema),
  );
  if (coursesRes.length === 0) {
    throw new ApiError('no courses found in MyCourses', HttpCode.NotFound);
  }

  const courses: AplusCourseData[] = coursesRes.map(course => ({
    id: course.id,
    courseCode: course.shortname,
    name: course.displayname,
    instance: `${new Date(course.startdate * 1000).toLocaleDateString()}-${new Date(
      course.enddate * 1000,
    ).toLocaleDateString()}`,
    url: undefined,
  }));

  return courses;
};

const fetchExerciseData: ExtServiceHandler['fetchExerciseData'] = async (req) => {
  const myCoursesToken = parseAuthToken(req);
  const moodleCourseId = validateMyCoursesCourseId(
    normalizeStringParam(req.params.serviceCourseId),
  );

  const exercisesRes = await fetchFromMyCourses(
    myCoursesToken,
    'core_grades_get_gradeitems',
    {courseid: moodleCourseId},
    MoodleGradeItemsResponseSchema,
  );

  return [
    {
      id: ExtServiceGradeSourceType.FullPoints,
      name: 'Course',
      items: [
        {
          id: 0,
          itemname: 'Full Points',
          sourceType: ExtServiceGradeSourceType.FullPoints,
        },
      ],
    },
    {
      id: ExtServiceGradeSourceType.Module,
      name: 'Elements',
      items: exercisesRes.gradeItems.map((item, index) => ({
        ...item,
        id: Number.isNaN(parseInt(item.id, 10))
          ? index + 1
          : parseInt(item.id, 10),
        sourceType: ExtServiceGradeSourceType.Module,
      })),
    },
  ];
};

const fetchGrades: ExtServiceHandler['fetchGrades'] = async (req) => {
  const myCoursesToken = parseAuthToken(req);
  const courseTaskIds = parseCourseTaskIdsFromQuery(req.query['course-tasks']);
  const parsedCourseId = normalizeStringParam(req.params.courseId);

  const gradesResCache: {
    [key: number]: z.output<typeof MoodleUserGradesResponseSchema>;
  } = {};
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
        links.map(async link =>
          ExternalSource.findByPk(link.externalSourceId),
        ),
      )
    ).filter((source): source is ExternalSource => source !== null);

    const myCoursesSources = linkedSources.filter(
      source => source.externalServiceName === 'MYCOURSES',
    );

    if (myCoursesSources.length === 0) {
      throw new ApiError(
        `Course task with ID ${courseTask.id} has no MyCourses external sources`,
        HttpCode.NotFound,
      );
    }

    for (const source of myCoursesSources) {
      const courseResult = ExtServiceCourseDataSchema.safeParse(source.externalCourse);
      if (!courseResult.success) {
        throw new ApiError(
          `Invalid external course data for source ${source.id}`,
          HttpCode.InternalServerError,
        );
      }

      const sourceInfoResult = MoodleSourceInfoSchema.safeParse(source.sourceInfo);
      if (!sourceInfoResult.success) {
        throw new ApiError(
          `Invalid source info for source ${source.id}`,
          HttpCode.InternalServerError,
        );
      }

      const sourceInfo = sourceInfoResult.data;
      const moodleCourseId = courseResult.data.id;

      if (!(moodleCourseId in gradesResCache)) {
        gradesResCache[moodleCourseId] = await fetchFromMyCourses(
          myCoursesToken,
          'gradereport_user_get_grade_items',
          {courseid: moodleCourseId},
          MoodleUserGradesResponseSchema,
        );
      }

      for (const userGrade of gradesResCache[moodleCourseId].usergrades) {
        if (!userGrade.useridnumber) {
          continue;
        }

        let selectedGradeItem = null;

        switch (sourceInfo.sourceType) {
          case ExtServiceGradeSourceType.FullPoints:
            selectedGradeItem =
              userGrade.gradeitems.find(item => item.itemtype === 'course') ?? null;
            break;

          case ExtServiceGradeSourceType.Module: {
            const sourceIdNumber =
              typeof sourceInfo.sourceId === 'number'
                ? sourceInfo.sourceId
                : parseInt(String(sourceInfo.sourceId), 10);

            selectedGradeItem =
              userGrade.gradeitems.find(item => item.id === sourceIdNumber)
              ?? null;

            if (selectedGradeItem === null && sourceInfo.itemname) {
              selectedGradeItem =
                userGrade.gradeitems.find(
                  item => item.itemname === sourceInfo.itemname,
                ) ?? null;
            }
            break;
          }

          case ExtServiceGradeSourceType.Exercise:
          case ExtServiceGradeSourceType.Difficulty:
            throw new ApiError(
              `Unsupported MyCourses source type ${sourceInfo.sourceType}`,
              HttpCode.BadRequest,
            );
        }

        if (selectedGradeItem === null) {
          continue;
        }

        if (selectedGradeItem.graderaw === null) {
          continue;
        }

        const epochSeconds =
          selectedGradeItem.gradedategraded
          ?? selectedGradeItem.gradedatesubmitted
          ?? null;
        const date =
          epochSeconds !== null
            ? new Date(epochSeconds * 1000)
            : sourceInfo.date ?? source.createdAt;

        const expiryDate = new Date(date);
        expiryDate.setDate(date.getDate() + (courseTask.daysValid ?? 0));

        newGrades.push({
          studentNumber: userGrade.useridnumber,
          courseTaskId: courseTask.id,
          externalSourceId: source.id,
          grade: selectedGradeItem.graderaw,
          date,
          expiryDate: courseTask.daysValid !== null ? expiryDate : null,
          comment: null,
        });
      }
    }
  }

  return newGrades;
};

export const moodleHandler: ExtServiceHandler = {
  externalServiceName: 'MYCOURSES',
  fetchCourses,
  fetchExerciseData,
  fetchGrades,
};
