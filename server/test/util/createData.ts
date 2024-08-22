// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as argon from 'argon2';

import {
  AplusGradeSourceType,
  type CoursePartData,
  CourseRoleType,
  type CourseTaskData,
  GradingScale,
  Language,
  type NewCourseData,
  SystemRole,
  type UserData,
} from '@/common/types';
import {initGraph} from '@/common/util';
import {ASSISTANT_ID, STUDENT_ID, TEACHER_ID} from './general';
import {sequelize} from '../../src/database';
import AplusGradeSource from '../../src/database/models/aplusGradeSource';
import Course from '../../src/database/models/course';
import CoursePart from '../../src/database/models/coursePart';
import CourseRole from '../../src/database/models/courseRole';
import CourseTask from '../../src/database/models/courseTask';
import CourseTranslation from '../../src/database/models/courseTranslation';
import FinalGrade from '../../src/database/models/finalGrade';
import GradingModel from '../../src/database/models/gradingModel';
import TaskGrade from '../../src/database/models/taskGrade';
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
      email: user?.email ?? `testUser${this.freeUserId}@aalto.fi`,
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

  async createAuthUser(
    user?: Partial<
      UserData & {
        password: string;
        forcePasswordReset: boolean;
        mfaSecret: string;
        mfaConfirmed: boolean;
      }
    >
  ): Promise<UserData> {
    const password = await argon.hash(user?.password ?? 'password', {
      type: argon.argon2id,
      memoryCost: 19456,
      parallelism: 1,
      timeCost: 2,
    });

    const newUser = await User.create({
      email: user?.email ?? `testUser${this.freeUserId}@aalto.fi`,
      name: user?.name ?? `test user${this.freeUserId}`,
      studentNumber: user?.studentNumber ?? `12345${this.freeUserId}`,
      role: SystemRole.Admin,
      password: password,
      forcePasswordReset: user?.forcePasswordReset ?? false,
      mfaSecret: user?.mfaSecret ?? null,
      mfaConfirmed: user?.mfaConfirmed ?? false,
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
      expiryDate: new Date(
        Date.now() + this.randInt(10, 365) * 24 * 3600 * 1000
      ),
    });
    this.freeCoursePartId += 1;
    return {
      id: newCoursePart.id,
      courseId: newCoursePart.courseId,
      name: newCoursePart.name,
      expiryDate:
        newCoursePart.expiryDate !== null
          ? new Date(newCoursePart.expiryDate)
          : null,
      archived: newCoursePart.archived,
    };
  }

  private async createCourseParts(courseId: number): Promise<CoursePartData[]> {
    const courseParts: CoursePartData[] = [];
    for (let i = 0; i < 4; i++) {
      const newCoursePart = await CoursePart.create({
        courseId: courseId,
        name: `Round ${i + 1}`,
        expiryDate: new Date(
          Date.now() + this.randInt(10, 365) * 24 * 3600 * 1000
        ),
      });

      courseParts.push({
        id: newCoursePart.id,
        courseId: newCoursePart.courseId,
        name: newCoursePart.name,
        expiryDate:
          newCoursePart.expiryDate !== null
            ? new Date(newCoursePart.expiryDate)
            : null,
        archived: newCoursePart.archived,
      });
    }
    return courseParts;
  }

  private async createCourseTasks(
    courseParts: CoursePartData[]
  ): Promise<CourseTaskData[]> {
    const courseTasks: CourseTaskData[] = [];
    for (const coursePart of courseParts) {
      for (let i = 0; i < 4; i++) {
        const newCoursePart = await CourseTask.create({
          coursePartId: coursePart.id,
          name: `Round ${i + 1}`,
        });

        courseTasks.push({
          id: newCoursePart.id,
          coursePartId: coursePart.id,
          name: newCoursePart.name,
          daysValid: newCoursePart.daysValid,
          maxGrade: newCoursePart.maxGrade,
          archived: newCoursePart.archived,
          aplusGradeSources: [],
        });
      }
    }
    return courseTasks;
  }

  async createAplusGradeSources(
    courseId: number
  ): Promise<
    [[number, number], [number, number], [number, number], [number, number]]
  > {
    const aplusCourse = {
      id: 1,
      courseCode: 'CS-789',
      name: 'The Name',
      instance: '1970',
      url: 'https://plus.cs.aalto.fi',
    };

    const fullPointsCoursePart = await this.createCoursePart(courseId);
    const fullPointsGradeSource = await AplusGradeSource.create({
      courseTaskId: fullPointsCoursePart.id,
      aplusCourse: aplusCourse,
      sourceType: AplusGradeSourceType.FullPoints,
      date: new Date(),
    });

    const moduleCoursePart = await this.createCoursePart(courseId);
    const moduleGradeSource = await AplusGradeSource.create({
      courseTaskId: moduleCoursePart.id,
      aplusCourse: aplusCourse,
      sourceType: AplusGradeSourceType.Module,
      moduleId: 1,
      moduleName: 'Module Name',
      date: new Date(),
    });

    const exerciseCoursePart = await this.createCoursePart(courseId);
    const exerciseGradeSource = await AplusGradeSource.create({
      courseTaskId: exerciseCoursePart.id,
      aplusCourse: aplusCourse,
      sourceType: AplusGradeSourceType.Exercise,
      exerciseId: 1,
      exerciseName: 'Exercise Name',
      date: new Date(),
    });

    const difficultyCoursePart = await this.createCoursePart(courseId);
    const difficultyGradeSource = await AplusGradeSource.create({
      courseTaskId: difficultyCoursePart.id,
      aplusCourse: aplusCourse,
      sourceType: AplusGradeSourceType.Difficulty,
      difficulty: 'A',
      date: new Date(),
    });

    return [
      [fullPointsCoursePart.id, fullPointsGradeSource.id],
      [moduleCoursePart.id, moduleGradeSource.id],
      [exerciseCoursePart.id, exerciseGradeSource.id],
      [difficultyCoursePart.id, difficultyGradeSource.id],
    ];
  }

  async createGrade(
    userId: number,
    courseTaskId: number,
    graderId: number,
    grade?: number,
    date?: Date,
    aplusGradeSourceId?: number
  ): Promise<number> {
    const gradeDate = date ?? new Date();
    const attGrade = await TaskGrade.create({
      userId: userId,
      courseTaskId: courseTaskId,
      graderId: graderId,
      date: gradeDate,
      expiryDate: new Date(gradeDate.getTime() + 365 * 24 * 3600 * 1000),
      grade: grade ?? this.randInt(0, 10),
      aplusGradeSourceId: aplusGradeSourceId,
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

  // TODO: Support course part models.
  /** Creates a grading model that uses the average model */
  async createGradingModel(
    courseId: number,
    courseParts: CoursePartData[],
    _courseTasks: CourseTaskData[]
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

  // TODO: Support create full models.
  async createCourse({
    hasTeacher = true,
    hasAssistant = true,
    hasStudent = true,
    courseData = null,
    createCourseParts = true,
    createCourseTasks = true,
    createGradingModel = true,
  }: {
    hasTeacher?: boolean;
    hasAssistant?: boolean;
    hasStudent?: boolean;
    courseData?: Partial<NewCourseData> | null;
    createCourseParts?: boolean;
    createCourseTasks?: boolean;
    createGradingModel?: boolean;
  }): Promise<[number, CoursePartData[], CourseTaskData[], number]> {
    const courseId = await this.createDbCourse(
      hasTeacher,
      hasAssistant,
      hasStudent,
      courseData
    );

    let courseParts: CoursePartData[] = [];
    if (createCourseParts) courseParts = await this.createCourseParts(courseId);

    let courseTasks: CourseTaskData[] = [];
    if (createCourseTasks)
      courseTasks = await this.createCourseTasks(courseParts);

    let gradingModelId = -1;
    if (createCourseParts && createCourseTasks && createGradingModel) {
      gradingModelId = await this.createGradingModel(
        courseId,
        courseParts,
        courseTasks
      );
    }

    return [courseId, courseParts, courseTasks, gradingModelId];
  }
}

export const createData = new CreateData();
