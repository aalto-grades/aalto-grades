// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { SISU_API_KEY, SISU_API_URL } from '../configs/environment';
import { axiosTimeout } from '../configs/config';
import { SisuInstance } from '../types/sisu';

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

export interface CourseData {
  id?: number,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface InstanceData {
  courseData: CourseData,
  id: number | string,
  startingPeriod: string,
  endingPeriod: string
  startDate: Date,
  endDate: Date,
  courseType: string,
  gradingType: string,
  responsibleTeachers: Array<string>,
}

export enum Language {
  English = 'EN',
  Finnish = 'FI',
  Swedish = 'SV'
}

function parseSisuInstance(instance: SisuInstance): InstanceData {
  return {
    id: instance.id,
    startingPeriod: '-',
    endingPeriod: '-',
    startDate: instance.startDate,
    endDate: instance.endDate,
    // TODO use enums here
    courseType: instance.type === 'exam-exam' ? 'EXAM' : 'LECTURE',
    gradingType: instance.summary.gradingScale.fi === '0-5' ? 'NUMERICAL' : 'PASSFAIL',
    responsibleTeachers: instance.summary.teacherInCharge,
    courseData: {
      courseCode: instance.code,
      minCredits: instance.credits.min,
      maxCredits: instance.credits.max,
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

export async function addCourse(req: Request, res: Response): Promise<void> {
  try {
    // TODO: add the course to the database
    res.send({
      success: true
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error,
    });
  }
}

export async function fetchAllInstancesFromSisu(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: string = String(req.params.courseId);
    const instancesFromSisu: AxiosResponse = await axios.get(`${SISU_API_URL}/courseunitrealisations`, {
      timeout: axiosTimeout,
      params: {
        code: courseId,
        USER_KEY: SISU_API_KEY
      }
    });

    if (instancesFromSisu.data?.error) throw new Error(instancesFromSisu.data.error.message);
    const parsedInstances: Array<InstanceData> = instancesFromSisu.data.map((instance: SisuInstance) => parseSisuInstance(instance));

    return res.status(200).send({
      success: true,
      instances: parsedInstances
    });
  } catch (error: unknown) {
    console.log(error);

    return res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

export async function fetchInstanceFromSisu(req: Request, res: Response): Promise<Response> {
  try {
    // instance id here is sisu id not course code, for example 'aalto-CUR-163498-3084205'
    const instanceId: string = String(req.params.instanceId);
    const instanceFromSisu: AxiosResponse = await axios.get(`${SISU_API_URL}/courseunitrealisations/${instanceId}`, {
      timeout: axiosTimeout,
      params: {
        USER_KEY: SISU_API_KEY
      }
    });

    if (instanceFromSisu.data?.error) throw new Error(instanceFromSisu.data.error.message);
    const instance: InstanceData = parseSisuInstance(instanceFromSisu.data);

    return res.status(200).send({
      success: true,
      instance: instance
    });

  } catch (error: unknown) {
    console.log(error);

    return res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}
