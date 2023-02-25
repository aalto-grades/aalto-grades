// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';

import { AXIOS_TIMEOUT } from '../configs/constants';
import { SISU_API_KEY, SISU_API_URL } from '../configs/environment';

import { ApiError } from '../types/error';
import { CourseInstanceData, GradingType, TeachingMethod } from '../types/course';
import { HttpCode } from '../types/httpCode';
import { SisuCourseInstance } from '../types/sisu';

function parseSisuCourseInstance(instance: SisuCourseInstance): CourseInstanceData {
  return {
    id: null,
    sisuCourseInstanceId: instance.id,
    startingPeriod: null,
    endingPeriod: null,
    minCredits: instance.credits.min,
    maxCredits: instance.credits.max,
    startDate: instance.startDate,
    endDate: instance.endDate,
    teachingMethod: (instance.type === 'exam-exam'
      ? TeachingMethod.Exam
      : TeachingMethod.Lecture),
    gradingType: (instance.summary.gradingScale.fi === '0-5'
      ? GradingType.Numerical
      : GradingType.PassFail),
    teachersInCharge: instance.summary.teacherInCharge,
    courseData: {
      courseCode: instance.code,
      department: {
        en: instance.organizationName.en,
        fi: instance.organizationName.fi,
        sv: instance.organizationName.sv
      },
      name: {
        en: instance.name.en,
        fi: instance.name.fi,
        sv: instance.name.sv
      },
      evaluationInformation: {
        en: instance.summary.assesmentMethods.en,
        fi: instance.summary.assesmentMethods.fi,
        sv: instance.summary.assesmentMethods.sv
      }
    }
  };
}

export async function fetchCourseInstanceFromSisu(req: Request, res: Response): Promise<void> {
  // Instance ID here is a Sisu course instance ID (e.g., 'aalto-CUR-163498-3084205'),
  // not a course code.
  const sisuCourseInstanceId: string = String(req.params.sisuCourseInstanceId);
  const courseInstanceFromSisu: AxiosResponse = await axios.get(
    `${SISU_API_URL}/courseunitrealisations/${sisuCourseInstanceId}`,
    {
      timeout: AXIOS_TIMEOUT,
      params: {
        USER_KEY: SISU_API_KEY
      }
    }
  );

  if (courseInstanceFromSisu.data?.error) {
    throw new ApiError(
      `external API error: ${courseInstanceFromSisu.data.error.code}`,
      HttpCode.BadGateway
    );
  }

  const instance: CourseInstanceData = parseSisuCourseInstance(courseInstanceFromSisu.data);

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstance: instance
    }
  });
}

export async function fetchAllCourseInstancesFromSisu(req: Request, res: Response): Promise<void> {
  const courseCode: string = String(req.params.courseCode);
  const courseInstancesFromSisu: AxiosResponse = await axios.get(
    `${SISU_API_URL}/courseunitrealisations`,
    {
      timeout: AXIOS_TIMEOUT,
      params: {
        code: courseCode,
        USER_KEY: SISU_API_KEY
      }
    }
  );

  if (courseInstancesFromSisu.data?.error) {
    throw new ApiError(
      `external API error: ${courseInstancesFromSisu.data.error.code}`,
      HttpCode.BadGateway
    );
  }

  const parsedInstances: Array<CourseInstanceData> = courseInstancesFromSisu.data.map(
    (instance: SisuCourseInstance) => parseSisuCourseInstance(instance)
  );

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstances: parsedInstances
    }
  });
}
