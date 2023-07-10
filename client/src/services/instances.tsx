// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { CourseInstanceData } from 'aalto-grades-common/types/course';
import { FullResponse, Numeric } from '../types';

async function getInstances(courseId: Numeric): Promise<Array<CourseInstanceData>> {

  const response: FullResponse<{ courseInstances: Array<CourseInstanceData> }> =
    await axios.get(`/v1/courses/${courseId}/instances`);

  return response.data.data.courseInstances;
}

async function createInstance(
  courseId: Numeric, instance: CourseInstanceData
): Promise<number> {

  const response: FullResponse<{ courseInstance: { id: number } }> =
    await axios.post(`/v1/courses/${courseId}/instances`, instance);

  return response.data.data.courseInstance.id;
}

async function getSisuInstances(courseCode: string): Promise<Array<CourseInstanceData>> {

  const response: FullResponse<{ courseInstances: Array<CourseInstanceData> }> =
    await axios.get('/v1/sisu/courses/' + courseCode);

  return response.data.data.courseInstances;
}

async function getSisuInstance(sisuInstanceId: string): Promise<CourseInstanceData> {

  const response: FullResponse<{ courseInstance: CourseInstanceData }> =
    await axios.get('/v1/sisu/instances/' + sisuInstanceId);

  return response.data.data.courseInstance;
}

export default { createInstance, getInstances, getSisuInstances, getSisuInstance };
