// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { AxiosResponse } from 'axios';
import { CourseInstanceData } from 'aalto-grades-common/types/course';
import { ApiResponse } from '../types/general';

async function getInstances(courseId: number | string): Promise<Array<CourseInstanceData>> {
  const response: AxiosResponse<
    ApiResponse<{ courseInstances: Array<CourseInstanceData> }>, unknown
  > = await axios.get(`/v1/courses/${courseId}/instances`);

  return response.data.data.courseInstances;
}

async function createInstance(courseId: number | string, instance: object): Promise<number> {
  const response: AxiosResponse<
    ApiResponse<{ courseInstance: { id: number } }>, unknown
  > = await axios.post(`/v1/courses/${courseId}/instances`, instance);

  return response.data.data.courseInstance.id;
}

async function getSisuInstances(courseCode: string): Promise<Array<CourseInstanceData>> {
  const response: AxiosResponse<
    ApiResponse<{ courseInstances: Array<CourseInstanceData> }>, unknown
  > = await axios.get('/v1/sisu/courses/' + courseCode);

  return response.data.data.courseInstances;
}

async function getSisuInstance(sisuInstanceId: string): Promise<CourseInstanceData> {
  const response: AxiosResponse<
    ApiResponse<{ courseInstance: CourseInstanceData }>, unknown
  > = await axios.get('/v1/sisu/instances/' + sisuInstanceId);

  return response.data.data.courseInstance;
}

// TODO: Remove from here
async function getAttainments(instanceId: number | string): Promise<any> {
  const response = await axios.get('/v1/??' + instanceId);
  console.log(response.data);
  return response.data;
}

export default { createInstance, getInstances, getSisuInstances, getSisuInstance, getAttainments };
