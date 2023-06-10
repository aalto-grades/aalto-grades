// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from './axios';
import { CourseInstanceData } from 'aalto-grades-common/types/course';

async function getInstances(courseId: number): Promise<Array<CourseInstanceData>> {
  const response = await axios.get(`/v1/courses/${courseId}/instances`);
  return response.data.data;
}

async function createInstance(courseId: number, instance: object) {
  const response = await axios.post(`/v1/courses/${courseId}/instances`, instance);
  return response.data.data;
}

async function getSisuInstances(courseId: number): Promise<{
  courseInstances: Array<CourseInstanceData>
}> {
  const response = await axios.get('/v1/sisu/courses/' + courseId);
  console.log(response.data);
  return response.data.data;
}

async function getSisuInstance(sisuInstanceId: string): Promise<{
  courseInstance: CourseInstanceData
}> {
  const response = await axios.get('/v1/sisu/instances/' + sisuInstanceId);
  console.log(response.data);
  return response.data.data;
}

async function getAttainments(instanceId: number): Promise<unknown> {
  const response = await axios.get('/v1/??' + instanceId);
  console.log(response.data);
  return response.data;
}

export default { createInstance, getInstances, getSisuInstances, getSisuInstance, getAttainments };
