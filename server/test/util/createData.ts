// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AttainmentData,
  CourseRoleType,
  GradingScale,
  Language,
  NewCourseData,
  SystemRole,
  UserData,
} from '@/common/types';
import {initGraph} from '@/common/util/initGraph';
import {ASSISTANT_ID, STUDENT_ID, TEACHER_ID} from './general';
import {sequelize} from '../../src/database';
import AssessmentModel from '../../src/database/models/assessmentModel';
import Attainment from '../../src/database/models/attainment';
import AttainmentGrade from '../../src/database/models/attainmentGrade';
import Course from '../../src/database/models/course';
import CourseRole from '../../src/database/models/courseRole';
import CourseTranslation from '../../src/database/models/courseTranslation';
import FinalGrade from '../../src/database/models/finalGrade';
import User from '../../src/database/models/user';

/**
 * Still relies on the test users admin@aalto.fi, teacher@aalto.fi,
 * assistant@aalto.fi, student@aalto.fi being created in the seed.
 */

/** Create data into the database */
class CreateData {
  /** Next free course code */
  private freeId: number = 10;
  /** Next free attainment name */
  private freeAttId: number = 10;
  /** Next free assessment model code */
  private freeModelId: number = 10;
  /** Next free user name */
  private freeUserId: number = 10;

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async createUser(user?: Partial<UserData>): Promise<UserData> {
    const newUser = await User.create({
      email: user?.email ?? `testuser${this.freeUserId}@aalto.fi`,
      name: user?.name ?? `test user${this.freeUserId}`,
      studentNumber: user?.studentNumber ?? `12345${this.freeUserId}`,
      role: SystemRole.User,
    });
    this.freeUserId += 1;
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      studentNumber: newUser.studentNumber,
    };
  }

  async createAttainment(courseId: number): Promise<AttainmentData> {
    const newAttainment = await Attainment.create({
      courseId: courseId,
      name: `Round ${this.freeAttId}`,
      daysValid: this.randInt(10, 365),
    });
    this.freeAttId += 1;
    return newAttainment;
  }

  private async createAttainments(courseId: number): Promise<AttainmentData[]> {
    const attainments: AttainmentData[] = [];
    for (let i = 0; i < 4; i++) {
      const newAttainment = await Attainment.create({
        courseId: courseId,
        name: `Round ${i + 1}`,
        daysValid: this.randInt(10, 365),
      });

      attainments.push(newAttainment);
    }
    return attainments;
  }

  async createGrade(
    userId: number,
    attainmentId: number,
    graderId: number,
    grade?: number,
    date?: Date
  ): Promise<number> {
    const gradeDate = date ?? new Date();
    const attGrade = await AttainmentGrade.create({
      userId: userId,
      attainmentId: attainmentId,
      graderId: graderId,
      date: gradeDate,
      expiryDate: new Date(gradeDate.getTime() + 365 * 24 * 3600 * 1000),
      grade: grade ?? this.randInt(0, 10),
    });

    return attGrade.id;
  }

  async createFinalGrade(
    courseId: number,
    userId: number,
    assessmentModelId: number,
    graderId: number,
    grade?: number
  ): Promise<number> {
    const finalGrade = await FinalGrade.create({
      userId: userId,
      assessmentModelId: assessmentModelId,
      courseId: courseId,
      graderId: graderId,
      date: new Date(),
      grade: grade ?? this.randInt(0, 5),
    });

    return finalGrade.id;
  }

  /** Creates an assessment model that uses the average model */
  async createAssessmentModel(
    courseId: number,
    attainments: AttainmentData[]
  ): Promise<number> {
    const assessmentModel = await AssessmentModel.create({
      courseId,
      name: `Average model ${this.freeModelId}`,
      graphStructure: initGraph('average', attainments),
    });

    this.freeModelId += 1;

    return assessmentModel.id;
  }

  private async createDbCourse(
    hasTeacher: boolean,
    hasAssistant: boolean,
    hasStudent: boolean,
    courseData: Partial<NewCourseData> | null
  ): Promise<number> {
    const course = await sequelize.transaction(async (t): Promise<Course> => {
      const newCourse = await Course.create(
        {
          courseCode: courseData?.courseCode ?? `CS-${this.freeId}`,
          minCredits: courseData?.minCredits ?? 0,
          maxCredits: courseData?.maxCredits ?? this.randInt(5, 15),
          gradingScale: courseData?.gradingScale ?? GradingScale.Numerical,
          languageOfInstruction:
            courseData?.languageOfInstruction ?? Language.English,
        },
        {transaction: t}
      );

      await CourseTranslation.bulkCreate(
        [
          {
            courseId: newCourse.id,
            language: Language.Finnish,
            department: courseData?.department?.fi ?? 'Tietotekniikan laitos',
            courseName: courseData?.name?.fi ?? `Testi kurssi ${this.freeId}`,
          },
          {
            courseId: newCourse.id,
            language: Language.English,
            department:
              courseData?.department?.en ?? 'Department of Computer Science',
            courseName: courseData?.name?.en ?? `Test course ${this.freeId}`,
          },
          {
            courseId: newCourse.id,
            language: Language.Swedish,
            department:
              courseData?.department?.sv ?? 'Institutionen för datateknik',
            courseName: courseData?.name?.sv ?? `testkurs ${this.freeId}`,
          },
        ],
        {transaction: t}
      );

      // Add teacher and assistant roles
      const teacherRoles = hasTeacher
        ? [
            {
              courseId: newCourse.id,
              userId: TEACHER_ID,
              role: CourseRoleType.Teacher,
            },
          ]
        : [];
      const assistantRoles = hasAssistant
        ? [
            {
              courseId: newCourse.id,
              userId: ASSISTANT_ID,
              role: CourseRoleType.Assistant,
            },
          ]
        : [];
      const studentRoles = hasStudent
        ? [
            {
              courseId: newCourse.id,
              userId: STUDENT_ID,
              role: CourseRoleType.Student,
            },
          ]
        : [];

      const newRoles = [...teacherRoles, ...assistantRoles, ...studentRoles];
      if (newRoles.length > 0) {
        await CourseRole.bulkCreate(newRoles, {transaction: t});
      }

      return newCourse;
    });

    this.freeId += 1;
    return course.id;
  }

  async createCourse({
    hasTeacher = true,
    hasAssistant = true,
    hasStudent = true,
    courseData = null,
    createAttainments = true,
    createAssessmentModel = true,
  }: {
    hasTeacher?: boolean;
    hasAssistant?: boolean;
    hasStudent?: boolean;
    courseData?: Partial<NewCourseData> | null;
    createAttainments?: boolean;
    createAssessmentModel?: boolean;
  }): Promise<[number, AttainmentData[], number]> {
    const courseId = await this.createDbCourse(
      hasTeacher,
      hasAssistant,
      hasStudent,
      courseData
    );

    let attainments: AttainmentData[] = [];
    if (createAttainments) attainments = await this.createAttainments(courseId);

    let assessmentModelId = -1;
    if (createAttainments && createAssessmentModel) {
      assessmentModelId = await this.createAssessmentModel(
        courseId,
        attainments
      );
    }

    return [courseId, attainments, assessmentModelId];
  }
}

export const createData = new CreateData();
