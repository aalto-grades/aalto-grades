// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import { CourseInstanceData, GradingType, Period, TeachingMethod } from '../types/course';
import { idSchema } from '../types/general';
import { Language } from '../types/language';
import { CourseWithTranslation } from '../types/model';
import { findUserById } from './utils/user';

interface CourseInstanceWithCourseAndTranslation extends CourseInstance {
  Course: CourseWithTranslation
}

export async function getCourseInstance(req: Request, res: Response): Promise<void> {
  try {
    const instanceId: number = Number(req.params.instanceId);
    await idSchema.validate({ id: instanceId });

    const instance: CourseInstanceWithCourseAndTranslation | null =
      await models.CourseInstance.findByPk(
        instanceId,
        {
          attributes: [
            'id', 'sisuCourseInstanceId', 'gradingType', 'startingPeriod',
            'endingPeriod', 'teachingMethod', 'minCredits', 'maxCredits',
            'startDate', 'endDate', 'responsibleTeacher'
          ],
          include: {
            model: Course,
            attributes: ['id', 'courseCode'],
            include: [
              {
                model: CourseTranslation,
                attributes: ['language', 'courseName', 'department']
              }
            ]
          }
        }
      ) as CourseInstanceWithCourseAndTranslation;

    if (!instance) {
      throw new Error(`course instance with an id ${instanceId} not found`);
    }

    const responsibleTeacher: User = await findUserById(instance.responsibleTeacher);

    const parsedInstanceData: CourseInstanceData = {
      id: instance.id,
      sisuCourseInstanceId: instance.sisuCourseInstanceId,
      startingPeriod: instance.startingPeriod,
      endingPeriod: instance.endingPeriod,
      minCredits: instance.minCredits,
      maxCredits: instance.maxCredits,
      startDate: instance.startDate,
      endDate: instance.endDate,
      courseType: instance.teachingMethod,
      gradingType: instance.gradingType,
      responsibleTeacher: responsibleTeacher?.name ?? '-',
      courseData: {
        id: instance.Course.id,
        courseCode: instance.Course.courseCode,
        department: {
          en: '',
          fi: '',
          sv: ''
        },
        name: {
          en: '',
          fi: '',
          sv: ''
        },
        evaluationInformation: {
          en: '',
          fi: '',
          sv: ''
        }
      }
    };

    instance.Course.CourseTranslations.forEach((translation: CourseTranslation) => {
      switch (translation.language) {
      case Language.English:
        parsedInstanceData.courseData.department.en = translation.department;
        parsedInstanceData.courseData.name.en = translation.courseName;
        break;
      case Language.Finnish:
        parsedInstanceData.courseData.department.fi = translation.department;
        parsedInstanceData.courseData.name.fi = translation.courseName;
        break;
      case Language.Swedish:
        parsedInstanceData.courseData.department.sv = translation.department;
        parsedInstanceData.courseData.name.sv = translation.courseName;
        break;
      }
    });

    res.status(200).send({
      success: true,
      instance: parsedInstanceData
    });
    return;
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof yup.ValidationError) {
      res.status(400).send({
        success: false,
        error: error.errors
      });
      return;
    }

    if (error instanceof Error && error?.message.startsWith('course instance with an id')) {
      res.status(404).send({
        success: false,
        error: error.message
      });
      return;
    }

    res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
    return;
  }
}

export interface CourseInstanceWithTeachers extends CourseInstance {
  teacher: User
}

export async function getAllCourseInstances(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: number = Number(req.params.courseId);
    await idSchema.validate({ id: courseId });

    const course: Course | null = await Course.findByPk(courseId);

    if (!course) {
      throw new Error(`course with id ${courseId} not found`);
    }

    // TODO: ADD FUNCTIONALITY FOR MULTIPLE RESPONSIBLE TEACHERS THROUGH COURS EROLE
    const instances: Array<CourseInstanceWithTeachers> = await CourseInstance.findAll({
      attributes: [
        'id', 'sisuCourseInstanceId', 'courseId', 'gradingType', 'startingPeriod',
        'endingPeriod', 'teachingMethod', 'responsibleTeacher', 'minCredits',
        'maxCredits', 'startDate', 'endDate', 'createdAt', 'updatedAt'
      ],
      where: {
        courseId: courseId
      },
      // TODO: CHANGE TO GO THROUGH COURSE ROLE INSTEAD OF GOING THROUGH
      // RESPONSIBLE TEACHER FOREIGN KEY
      include: {
        model: User,
        as: 'teacher'
      }
    }) as Array<CourseInstanceWithTeachers>;

    const instancesData: Array<CourseInstanceData> = [];

    instances.forEach((instanceWithTeacher: CourseInstanceWithTeachers) => {
      const instanceData: CourseInstanceData = {
        courseData: {
          id: course.id,
          courseCode: course.courseCode,
          department: {
            en: '',
            fi: '',
            sv: ''
          },
          name: {
            en: '',
            fi: '',
            sv: ''
          },
          evaluationInformation: {
            en: '',
            fi: '',
            sv: ''
          }
        },
        sisuCourseInstanceId: instanceWithTeacher.sisuCourseInstanceId,
        id: instanceWithTeacher.id,
        startingPeriod: instanceWithTeacher.startingPeriod,
        endingPeriod: instanceWithTeacher.endingPeriod,
        minCredits: instanceWithTeacher.minCredits,
        maxCredits: instanceWithTeacher.maxCredits,
        startDate: instanceWithTeacher.startDate,
        endDate: instanceWithTeacher.endDate,
        courseType: '',
        gradingType: instanceWithTeacher.gradingType,
        // TODO: Get multiple responsible teachers through course roles.
        responsibleTeacher: instanceWithTeacher.teacher.name,
      };

      instancesData.push(instanceData);

    });
    return res.status(200).send({
      success: true,
      data: {
        courseInstances: instancesData
      }
    });

  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).send({
        success: false,
        error: error.errors
      });
    }

    if (error instanceof Error && error?.message.startsWith('course with id')) {
      return res.status(404).send({
        success: false,
        error: error.message
      });
    }

    return res.status(500).send({
      success: false,
      error: 'internal server error'
    });
  }
}

interface CourseInstanceAddRequest {
  sisuCourseInstanceId: string | null;
  gradingType: GradingType;
  startingPeriod: Period;
  endingPeriod: Period;
  teachingMethod: TeachingMethod;
  responsibleTeacher: number;
  minCredits: number;
  maxCredits: number;
  startDate: Date;
  endDate: Date;
}

export async function addCourseInstance(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    gradingType: yup
      .string()
      .oneOf([GradingType.PassFail, GradingType.Numerical])
      .required(),
    sisuCourseInstanceId: yup
      .string()
      .notRequired(),
    startingPeriod: yup
      .string()
      .oneOf([Period.I, Period.II, Period.III, Period.IV, Period.V])
      .required(),
    endingPeriod: yup
      .string()
      .oneOf([Period.I, Period.II, Period.III, Period.IV, Period.V])
      .required(),
    teachingMethod: yup
      .string()
      .oneOf([TeachingMethod.Lecture, TeachingMethod.Exam])
      .required(),
    responsibleTeacher: yup
      .number()
      .required(),
    minCredits: yup
      .number()
      .min(0)
      .required(),
    maxCredits: yup
      .number()
      .min(yup.ref('minCredits'))
      .required(),
    startDate: yup
      .date()
      .required(),
    endDate: yup
      .date()
      .required()
  });

  try {
    const courseId: number = Number(req.params.courseId);

    await requestSchema.validate(req.body, { abortEarly: false });

    const request: CourseInstanceAddRequest = req.body;

    const course: Course | null = await models.Course.findOne({
      where: {
        id: courseId
      },
    });

    if (course == null) {
      throw new Error(`Course with ID ${courseId} does not exist`);
    }

    const teacher: User | null = await models.User.findOne({
      where: {
        id: request.responsibleTeacher
      },
    });

    if (teacher == null) {
      throw new Error(`User with ID ${request.responsibleTeacher} does not exist`);
    }

    const newInstance: CourseInstance = await models.CourseInstance.create({
      courseId: courseId,
      sisuCourseInstanceId: request.sisuCourseInstanceId ?? null,
      gradingType: request.gradingType,
      startingPeriod: request.startingPeriod,
      endingPeriod: request.endingPeriod,
      teachingMethod: request.teachingMethod,
      responsibleTeacher: request.responsibleTeacher,
      minCredits: request.minCredits,
      maxCredits: request.maxCredits,
      startDate: request.startDate,
      endDate: request.endDate
    });

    res.send({
      success: true,
      instance: {
        id: newInstance.id
      }
    });
    return;
  } catch (error) {

    if (error instanceof yup.ValidationError) {
      res.status(400).send({
        success: false,
        error: error.errors
      });
      return;
    }

    res.status(401).send({
      success: false,
      error: error
    });
    return;
  }
}
