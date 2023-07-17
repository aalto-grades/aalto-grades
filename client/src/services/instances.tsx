// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseInstanceData } from 'aalto-grades-common/types';

import axios from './axios';
import { FullResponse, Numeric } from '../types';

export async function getInstances(courseId: Numeric): Promise<Array<CourseInstanceData>> {

  const response: FullResponse<{ courseInstances: Array<CourseInstanceData> }> =
    await axios.get(`/v1/courses/${courseId}/instances`);

  return response.data.data.courseInstances;
}

export async function createInstance(
  courseId: Numeric, instance: CourseInstanceData
): Promise<number> {

  const response: FullResponse<{ courseInstance: { id: number } }> =
    await axios.post(`/v1/courses/${courseId}/instances`, instance);

  return response.data.data.courseInstance.id;
}

export async function getSisuInstances(courseCode: string): Promise<Array<CourseInstanceData>> {

  const response: FullResponse<{ courseInstances: Array<CourseInstanceData> }> =
    await axios.get('/v1/sisu/courses/' + courseCode);

  return response.data.data.courseInstances;
}

export async function getSisuInstance(sisuInstanceId: string): Promise<CourseInstanceData> {

  const response: FullResponse<{ courseInstance: CourseInstanceData }> =
    await axios.get('/v1/sisu/instances/' + sisuInstanceId);

  return response.data.data.courseInstance;
}
