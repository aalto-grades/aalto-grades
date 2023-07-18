// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { Op } from 'sequelize';

import { AXIOS_TIMEOUT } from '../configs/constants';
import { SISU_API_KEY, SISU_API_URL } from '../configs/environment';

import CourseInstance from '../database/models/courseInstance';

import { CourseInstanceData, GradingScale } from 'aalto-grades-common/types';
import { ApiError, HttpCode, SisuCourseInstance } from '../types';

function parseSisuGradingScale(gradingScale: string): GradingScale | undefined {
  switch (gradingScale) {
  case '0-5':
    return GradingScale.Numerical;
  case 'sis-hyl-hyv': // TODO: Is this correct?
    return GradingScale.PassFail;
  case 'toinen-kotim':
    return GradingScale.SecondNationalLanguage;
  default:
    throw new Error(`unknown grading scale from Sisu: ${gradingScale}`);
  }
}

function parseSisuCourseInstance(
  instance: SisuCourseInstance, takenIds: Array<string>
): CourseInstanceData {
  return {
    sisuInstanceInUse: takenIds.includes(instance.id),
    sisuCourseInstanceId: instance.id,
    startDate: instance.startDate,
    endDate: instance.endDate,
    type: instance.type,
    gradingScale: parseSisuGradingScale(instance.summary.gradingScale.fi) as GradingScale,
    courseData: {
      courseCode: instance.code,
      minCredits: instance.credits.min,
      maxCredits: instance.credits.max,
      teachersInCharge: instance.summary.teacherInCharge.map(
        (name: string) => {
          return {
            name: name
          };
        }
      ),
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
      validateStatus: function (status: number) {
        return status >= 200 && status < 500;
      },
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

  const isTaken: CourseInstance | null = await CourseInstance.findOne({
    where: {
      sisuCourseInstanceId: courseInstanceFromSisu.data.id
    }
  });

  const instance: CourseInstanceData = parseSisuCourseInstance(
    courseInstanceFromSisu.data,
    isTaken ? [isTaken.sisuCourseInstanceId] : []
  );

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstance: instance
    }
  });
}

export async function fetchAllCourseInstancesFromSisu(req: Request, res: Response): Promise<void> {
  const courseCode: string = String(req.params.courseCode);
  let takenIds: Array<string> = [];
  const courseInstancesFromSisu: AxiosResponse = await axios.get(
    `${SISU_API_URL}/courseunitrealisations`,
    {
      timeout: AXIOS_TIMEOUT,
      validateStatus: function (status: number) {
        return status >= 200 && status < 500;
      },
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

  const takenInstances: Array<CourseInstance> | null = await CourseInstance.findAll({
    where: {
      sisuCourseInstanceId: {
        [Op.in]: courseInstancesFromSisu.data.map(
          (instance: SisuCourseInstance) => instance.id
        )
      }
    }
  });

  if (takenInstances) {
    takenIds = takenInstances.map((instance: CourseInstance) => instance.sisuCourseInstanceId);
  }

  const parsedInstances: Array<CourseInstanceData> = courseInstancesFromSisu.data.map(
    (instance: SisuCourseInstance) => parseSisuCourseInstance(instance, takenIds)
  );

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstances: parsedInstances
    }
  });
}
