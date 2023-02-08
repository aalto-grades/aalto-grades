// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';

import { AXIOS_TIMEOUT } from '../configs/constants';
import { SISU_API_KEY, SISU_API_URL } from '../configs/environment';

import { CourseInstanceData, GradingType, TeachingMethod } from '../types/course';
import { SisuCourseInstance } from '../types/sisu';

function parseSisuCourseInstance(instance: SisuCourseInstance): CourseInstanceData {
  return {
    // Instance ID is either Sisu instance ID (string) or number type ID in
    // Aalto Grades database.
    id: instance.id,
    startingPeriod: '-',
    endingPeriod: '-',
    minCredits: instance.credits.min,
    maxCredits: instance.credits.max,
    startDate: instance.startDate,
    endDate: instance.endDate,
    courseType: (
      instance.type === 'exam-exam'
        ? TeachingMethod.Exam
        : TeachingMethod.Lecture
    ),
    gradingType: (
      instance.summary.gradingScale.fi === '0-5'
        ? GradingType.Numerical
        : GradingType.PassFail
    ),
    responsibleTeachers: instance.summary.teacherInCharge,
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

export async function fetchAllCourseInstancesFromSisu(req: Request, res: Response): Promise<void> {
  try {
    const courseId: string = String(req.params.courseId);
    const instancesFromSisu: AxiosResponse = await axios.get(
      `${SISU_API_URL}/courseunitrealisations`,
      {
        timeout: AXIOS_TIMEOUT,
        params: {
          code: courseId,
          USER_KEY: SISU_API_KEY
        }
      }
    );

    if (instancesFromSisu.data?.error) {
      throw new Error(instancesFromSisu.data.error.message);
    }

    const parsedInstances: Array<CourseInstanceData> = instancesFromSisu.data.map(
      (instance: SisuCourseInstance) => {
        parseSisuCourseInstance(instance);
      }
    );

    res.status(200).send({
      success: true,
      instances: parsedInstances
    });
    return;
  } catch (error: unknown) {
    console.log(error);

    res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
    return;
  }
}

export async function fetchCourseInstanceFromSisu(req: Request, res: Response): Promise<void> {
  try {
    // Instance ID here is a Sisu ID, for example 'aalto-CUR-163498-3084205',
    // not a course code.
    const instanceId: string = String(req.params.instanceId);
    const instanceFromSisu: AxiosResponse = await axios.get(
      `${SISU_API_URL}/courseunitrealisations/${instanceId}`,
      {
        timeout: AXIOS_TIMEOUT,
        params: {
          USER_KEY: SISU_API_KEY
        }
      }
    );

    if (instanceFromSisu.data?.error) {
      throw new Error(instanceFromSisu.data.error.message);
    }

    const instance: CourseInstanceData = parseSisuCourseInstance(instanceFromSisu.data);

    res.status(200).send({
      success: true,
      instance: instance
    });
    return;
  } catch (error: unknown) {
    console.log(error);

    res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
    return;
  }
}
