// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AplusGradeSourceType,
  CoursePartData,
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
import AplusGradeSource from '../../src/database/models/aplusGradeSource';
import AttainmentGrade from '../../src/database/models/attainmentGrade';
import Course from '../../src/database/models/course';
import CoursePart from '../../src/database/models/coursePart';
import CourseRole from '../../src/database/models/courseRole';
import CourseTranslation from '../../src/database/models/courseTranslation';
import FinalGrade from '../../src/database/models/finalGrade';
import GradingModel from '../../src/database/models/gradingModel';
import User from '../../src/database/models/user';

/**
 * Still relies on the test users admin@aalto.fi, teacher@aalto.fi,
 * assistant@aalto.fi, student@aalto.fi being created in the seed.
 */

/** Create data into the database */
class CreateData {
  /** Next free course code */
  private freeId: number = 10;
  /** Next free course part name */
  private freeCoursePartId: number = 10;
  /** Next free grading model code */
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

  async createCoursePart(courseId: number): Promise<CoursePartData> {
    const newCoursePart = await CoursePart.create({
      courseId: courseId,
      name: `Round ${this.freeCoursePartId}`,
      daysValid: this.randInt(10, 365),
    });
    this.freeCoursePartId += 1;
    return {
      id: newCoursePart.id,
      courseId: newCoursePart.courseId,
      name: newCoursePart.name,
      daysValid: newCoursePart.daysValid,
      archived: newCoursePart.archived,
      aplusGradeSources: [],
    };
  }

  private async createCourseParts(courseId: number): Promise<CoursePartData[]> {
    const courseParts: CoursePartData[] = [];
    for (let i = 0; i < 4; i++) {
      const newCoursePart = await CoursePart.create({
        courseId: courseId,
        name: `Round ${i + 1}`,
        daysValid: this.randInt(10, 365),
      });

      courseParts.push({
        id: newCoursePart.id,
        courseId: newCoursePart.courseId,
        name: newCoursePart.name,
        daysValid: newCoursePart.daysValid,
        archived: newCoursePart.archived,
        aplusGradeSources: [],
      });
    }
    return courseParts;
  }

  async createAplusGradeSources(
    courseId: number
  ): Promise<[number, number, number]> {
    const fullPointsCoursePart = await this.createCoursePart(courseId);
    await AplusGradeSource.create({
      coursePartId: fullPointsCoursePart.id,
      aplusCourse: {
        id: 1,
        courseCode: 'CS-789',
        name: 'The Name',
        instance: '1970',
        url: 'https://plus.cs.aalto.fi',
      },
      sourceType: AplusGradeSourceType.FullPoints,
    });

    const moduleCoursePart = await this.createCoursePart(courseId);
    await AplusGradeSource.create({
      coursePartId: moduleCoursePart.id,
      aplusCourse: {
        id: 1,
        courseCode: 'CS-789',
        name: 'The Name',
        instance: '1970',
        url: 'https://plus.cs.aalto.fi',
      },
      sourceType: AplusGradeSourceType.Module,
      moduleId: 1,
      moduleName: 'Module Name',
    });

    const difficultyCoursePart = await this.createCoursePart(courseId);
    await AplusGradeSource.create({
      coursePartId: difficultyCoursePart.id,
      aplusCourse: {
        id: 1,
        courseCode: 'CS-789',
        name: 'The Name',
        instance: '1970',
        url: 'https://plus.cs.aalto.fi',
      },
      sourceType: AplusGradeSourceType.Difficulty,
      difficulty: 'A',
    });

    return [
      fullPointsCoursePart.id,
      moduleCoursePart.id,
      difficultyCoursePart.id,
    ];
  }

  async createGrade(
    userId: number,
    coursePartId: number,
    graderId: number,
    grade?: number,
    date?: Date
  ): Promise<number> {
    const gradeDate = date ?? new Date();
    const attGrade = await AttainmentGrade.create({
      userId: userId,
      coursePartId: coursePartId,
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
    gradingModelId: number | null,
    graderId: number,
    grade?: number,
    date?: Date
  ): Promise<number> {
    const finalGrade = await FinalGrade.create({
      userId: userId,
      gradingModelId: gradingModelId,
      courseId: courseId,
      graderId: graderId,
      date: date ?? new Date(),
      grade: grade ?? this.randInt(0, 5),
    });

    return finalGrade.id;
  }

  /** Creates a grading model that uses the average model */
  async createGradingModel(
    courseId: number,
    courseParts: CoursePartData[]
  ): Promise<number> {
    const gradingModel = await GradingModel.create({
      courseId,
      name: `Average model ${this.freeModelId}`,
      graphStructure: initGraph('average', courseParts),
    });

    this.freeModelId += 1;

    return gradingModel.id;
  }

  async createRole(
    courseId: number,
    userId: number,
    role: CourseRoleType
  ): Promise<void> {
    await CourseRole.create({courseId, userId, role});
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
    createCourseParts = true,
    createGradingModel = true,
  }: {
    hasTeacher?: boolean;
    hasAssistant?: boolean;
    hasStudent?: boolean;
    courseData?: Partial<NewCourseData> | null;
    createCourseParts?: boolean;
    createGradingModel?: boolean;
  }): Promise<[number, CoursePartData[], number]> {
    const courseId = await this.createDbCourse(
      hasTeacher,
      hasAssistant,
      hasStudent,
      courseData
    );

    let courseParts: CoursePartData[] = [];
    if (createCourseParts) courseParts = await this.createCourseParts(courseId);

    let gradingModelId = -1;
    if (createCourseParts && createGradingModel) {
      gradingModelId = await this.createGradingModel(courseId, courseParts);
    }

    return [courseId, courseParts, gradingModelId];
  }
}

export const createData = new CreateData();
