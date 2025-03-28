// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT
import cloneDeep from 'lodash/cloneDeep';
import {Op, type WhereOptions} from 'sequelize';

import {
  ActionType,
  CourseRoleType,
  type EditTaskGradeData,
  type FinalGradeData,
  HttpCode,
  type LatestGrades,
  type NewTaskGrade,
  type StudentRow,
  type TaskGradeData,
  type TaskGradeHistory,
  type TaskGradeHistoryArray,
  type UserData,
  type UserIdArray,
} from '@/common/types';
import {sequelize} from '../database';
import AplusGradeSource from '../database/models/aplusGradeSource';
import CoursePart from '../database/models/coursePart';
import CourseRole from '../database/models/courseRole';
import CourseTask from '../database/models/courseTask';
import FinalGrade from '../database/models/finalGrade';
import TaskGrade from '../database/models/taskGrade';
import TaskGradeLog from '../database/models/taskGradeLog';
import User from '../database/models/user';
import {
  ApiError,
  type Endpoint,
  type JwtClaims,
  type NewDbTaskGradeData,
  type NewDbTaskGradeLogData,
} from '../types';
import {validateAplusGradeSourceBelongsToCourseTask} from './utils/aplus';
import {validateCourseId} from './utils/course';
import {validateCourseTaskBelongsToCourse} from './utils/courseTask';
import {parseFinalGrade} from './utils/finalGrade';
import {parsePreviousState} from './utils/history';
import {
  findAndValidateTaskGradePath,
  parseTaskGrade,
  validateUserAndGrader,
} from './utils/taskGrade';

/**
 * () => StudentRow[]
 *
 * @throws ApiError(400|404)
 */
export const getGrades: Endpoint<void, StudentRow[]> = async (req, res) => {
  const courseId = await validateCourseId(req.params.courseId);

  // Get all course tasks for the course
  const courseParts = await CoursePart.findAll({where: {courseId}});
  const courseTasks = await CourseTask.findAll({
    where: {coursePartId: courseParts.map(part => part.id)},
  });

  // Get grades of all course tasks
  const grades = await TaskGrade.findAll({
    include: [
      {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
      {
        model: User,
        as: 'grader',
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
      {model: AplusGradeSource},
    ],
    where: {
      courseTaskId: courseTasks.map(courseTask => courseTask.id),
    },
  });

  // Get finalGrades for all students
  const finalGrades = await FinalGrade.findAll({
    include: [
      {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
      {
        model: User,
        as: 'grader',
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
    ],
    where: {courseId: courseId},
  });

  type StudentData = {
    user: UserData & {studentNumber: string};
    grades: {[key: string]: TaskGradeData[]};
    finalGrades: FinalGradeData[];
  };
  const studentData = new Map<number, StudentData>();

  for (const grade of grades) {
    const [user] = validateUserAndGrader(grade);
    if (!studentData.has(user.id))
      studentData.set(user.id, {user, grades: {}, finalGrades: []});

    const userGrades = (studentData.get(user.id) as StudentData).grades;
    if (!Object.hasOwn(userGrades, grade.courseTaskId))
      userGrades[grade.courseTaskId] = [];

    userGrades[grade.courseTaskId].push(parseTaskGrade(grade));
  }

  for (const finalGrade of finalGrades) {
    const [user] = validateUserAndGrader(finalGrade);

    if (!studentData.has(user.id))
      studentData.set(user.id, {user, grades: {}, finalGrades: []});

    const userFinalGrades = (studentData.get(user.id) as StudentData)
      .finalGrades;
    userFinalGrades.push(parseFinalGrade(finalGrade));
  }

  const studentRows = Array.from(studentData.values()).map(
    (data): StudentRow => ({
      user: data.user,
      finalGrades: data.finalGrades,
      courseTasks: courseTasks.map(courseTask => ({
        courseTaskId: courseTask.id,
        courseTaskName: courseTask.name,
        grades:
          (data.grades[courseTask.id] as TaskGradeData[] | undefined) ?? [],
      })),
    })
  );

  res.json(studentRows);
};

/** () => TaskGradeLog[] */
export const getGradeLogs: Endpoint<void, TaskGradeHistoryArray> = async (
  req,
  res
) => {
  const userId = req.query.userId as string | undefined;
  const courseTaskIds = req.query.courseTaskIds as string | undefined;
  const taskGradeId = req.query.taskGradeId as string | undefined;

  const isConvertibleToInteger = (value: string | undefined): boolean => {
    return (
      value !== undefined &&
      !isNaN(Number(value)) &&
      Number.isInteger(Number(value))
    );
  };

  if (userId !== undefined && !isConvertibleToInteger(userId)) {
    throw new ApiError(`Invalid user id ${userId}`, HttpCode.BadRequest);
  }

  if (taskGradeId !== undefined && !isConvertibleToInteger(taskGradeId)) {
    throw new ApiError(
      `Invalid task grade id ${taskGradeId}`,
      HttpCode.BadRequest
    );
  }

  const whereCondition: WhereOptions = {};

  if (isConvertibleToInteger(userId)) {
    whereCondition.userId = userId;
  }

  if (isConvertibleToInteger(taskGradeId)) {
    whereCondition.taskGradeId = taskGradeId;
  }

  const courseTaskIdsSet: Set<number> = new Set();

  if (courseTaskIds !== undefined) {
    const courseTaskIdsStringList: string[] = courseTaskIds.split(',');
    for (const taskId of courseTaskIdsStringList) {
      if (isConvertibleToInteger(taskId)) {
        courseTaskIdsSet.add(Number(taskId.trim()));
      } else {
        throw new ApiError(
          `Invalid course task ids [${courseTaskIds}]`,
          HttpCode.BadRequest
        );
      }
    }
    whereCondition.courseTaskId = {
      [Op.in]: Array.from(courseTaskIdsSet),
    };
  }

  const gradeLogs = await TaskGradeLog.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
      {
        model: TaskGrade,
        as: 'taskGrade',
        include: [
          {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
          {
            model: User,
            as: 'grader',
            attributes: ['id', 'name', 'email', 'studentNumber'],
          },
          {model: AplusGradeSource},
        ],
      },
    ],
    where: whereCondition,
    attributes: {exclude: ['userId', 'UserId', 'taskGradeId', 'TaskGradeId']},
  });

  const parsedGradeLogs: TaskGradeHistoryArray = gradeLogs.map(log => {
    return {
      id: log.id,
      courseTaskId: log.courseTaskId,
      actionType: log.actionType,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      user: log.user,
      taskGrade: log.taskGrade ? parseTaskGrade(log.taskGrade) : null,
      previousState: log.previousState
        ? parsePreviousState(log.previousState)
        : null,
    } as TaskGradeHistory;
  });

  res.json(parsedGradeLogs);
};

/**
 * (NewTaskGrade[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const addGrades: Endpoint<NewTaskGrade[], void> = async (req, res) => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  // Validate that course tasks and A+ grade sources belong to correct course
  const validCourseTaskIds = new Set<number>();
  const validAPlusCourseTaskIds = new Set<number>();
  for (const grade of req.body) {
    // Validate course task id
    if (!validCourseTaskIds.has(grade.courseTaskId)) {
      await validateCourseTaskBelongsToCourse(courseId, grade.courseTaskId);
      validCourseTaskIds.add(grade.courseTaskId);
    }

    // Validate A+ course task id
    if (
      grade.aplusGradeSourceId !== null &&
      !validAPlusCourseTaskIds.has(grade.aplusGradeSourceId)
    ) {
      await validateAplusGradeSourceBelongsToCourseTask(
        grade.courseTaskId,
        grade.aplusGradeSourceId
      );
      validAPlusCourseTaskIds.add(grade.aplusGradeSourceId);
    }
  }

  // Check all users (students) exists in db, create new users if needed.
  // Make sure each studentNumber is only in the list once
  const studentNumbers = Array.from(
    new Set(req.body.map(grade => grade.studentNumber))
  );

  const dbStudentNumbers = (await User.findAll({
    attributes: ['studentNumber'],
    where: {
      studentNumber: {[Op.in]: studentNumbers},
    },
  })) as {studentNumber: string}[];
  const foundStudents = new Set(
    dbStudentNumbers.map(student => student.studentNumber)
  );
  const nonExistingStudents = studentNumbers.filter(
    id => !foundStudents.has(id)
  );

  // Create missing users
  if (nonExistingStudents.length > 0) {
    await sequelize.transaction(async t => {
      await User.bulkCreate(
        nonExistingStudents.map(studentNumber => ({
          studentNumber: studentNumber,
        })),
        {transaction: t}
      );
    });
  }

  // All students now exists in the database.
  const students = (await User.findAll({
    attributes: ['id', 'studentNumber'],
    where: {studentNumber: {[Op.in]: studentNumbers}},
  })) as {id: number; studentNumber: string}[];

  const studentNumberToId = Object.fromEntries(
    students.map(student => [student.studentNumber, student.id])
  );

  await sequelize.transaction(async t => {
    const preparedBulkCreate: NewDbTaskGradeData[] = [];

    for (const gradeEntry of req.body) {
      const userId = studentNumberToId[gradeEntry.studentNumber];

      // If a student already has a grade for a particular A+ grade source,
      // don't create a new grade row. Instead, update the existing one.
      if (gradeEntry.aplusGradeSourceId !== null) {
        const grade = await TaskGrade.findOne({
          where: {
            userId: userId,
            courseTaskId: gradeEntry.courseTaskId,
            aplusGradeSourceId: gradeEntry.aplusGradeSourceId,
          },
        });

        if (grade) {
          await grade
            .set({
              grade: gradeEntry.grade,
              date: gradeEntry.date,
              expiryDate: gradeEntry.expiryDate,
              graderId: grader.id,
            })
            .save({transaction: t});
          continue;
        }
      }

      preparedBulkCreate.push({
        userId: userId,
        courseTaskId: gradeEntry.courseTaskId,
        graderId: grader.id,
        aplusGradeSourceId: gradeEntry.aplusGradeSourceId ?? undefined,
        date: gradeEntry.date,
        expiryDate: gradeEntry.expiryDate,
        grade: gradeEntry.grade,
      });
    }

    // await TaskGrade.bulkCreate(preparedBulkCreate, {transaction: t});
    const createdTaskGrades = await TaskGrade.bulkCreate(preparedBulkCreate, {
      transaction: t,
    });

    if (createdTaskGrades.length > 0) {
      const preparedLogsBulkCreate: NewDbTaskGradeLogData[] = [];
      for (const taskGrade of createdTaskGrades) {
        preparedLogsBulkCreate.push({
          userId: grader.id,
          courseTaskId: taskGrade.courseTaskId,
          taskGradeId: taskGrade.id,
          actionType: ActionType.Create,
          previousState: cloneDeep(taskGrade),
        });
      }
      await TaskGradeLog.bulkCreate(preparedLogsBulkCreate, {
        transaction: t,
      });
    }
  });

  // Create student roles for all the students
  const studentUserIds = students.map(student => student.id);
  const dbCourseRoles = await CourseRole.findAll({
    attributes: ['userId'],
    where: {
      courseId: courseId,
      userId: {[Op.in]: studentUserIds},
      role: CourseRoleType.Student,
    },
  });
  const studentsWithRoles = new Set(dbCourseRoles.map(role => role.userId));
  const missingRoles = studentUserIds.filter(
    userId => !studentsWithRoles.has(userId)
  );
  await CourseRole.bulkCreate(
    missingRoles.map(userId => ({
      courseId: courseId,
      userId: userId,
      role: CourseRoleType.Student,
    }))
  );

  return res.sendStatus(HttpCode.Created);
};

/**
 * (EditTaskGradeData) => void
 *
 * @throws ApiError(400|404|409)
 */
export const editGrade: Endpoint<EditTaskGradeData, void> = async (
  req,
  res
) => {
  const grader = req.user as JwtClaims;
  const [, gradeData] = await findAndValidateTaskGradePath(
    req.params.courseId,
    req.params.gradeId
  );

  const {grade, date, expiryDate, comment} = req.body;

  if (
    date !== undefined &&
    expiryDate === undefined &&
    gradeData.expiryDate !== null &&
    date > new Date(gradeData.expiryDate)
  ) {
    throw new ApiError(
      `New date (${date.toString()}) can't be later than` +
        ` existing expiration date (${gradeData.expiryDate.toString()})`,
      HttpCode.BadRequest
    );
  } else if (
    expiryDate &&
    date === undefined &&
    new Date(gradeData.date) > expiryDate
  ) {
    throw new ApiError(
      `New expiration date (${expiryDate.toString()}) can't be before` +
        ` existing date (${gradeData.date.toString()})`,
      HttpCode.BadRequest
    );
  }

  if (gradeData.aplusGradeSourceId !== null && grade !== undefined) {
    throw new ApiError(
      'Grade field of A+ grades cannot be edited',
      HttpCode.BadRequest
    );
  }

  const previousState = cloneDeep(gradeData);

  await gradeData
    .set({
      grade: grade ?? gradeData.grade,
      date: date ?? gradeData.date,
      expiryDate: expiryDate,
      comment: comment !== undefined ? comment : gradeData.comment,
      graderId: grader.id,
    })
    .save();

  await TaskGradeLog.create({
    userId: grader.id,
    courseTaskId: gradeData.courseTaskId,
    taskGradeId: gradeData.id,
    actionType: ActionType.Update,
    previousState,
  });

  res.sendStatus(HttpCode.Ok);
};

/**
 * () => void
 *
 * @throws ApiError(400|404|409)
 */
export const deleteGrade: Endpoint<void, void> = async (req, res) => {
  const [, grade] = await findAndValidateTaskGradePath(
    req.params.courseId,
    req.params.gradeId
  );
  const grader = req.user as JwtClaims;

  await grade.destroy();

  await TaskGradeLog.create({
    userId: grader.id,
    courseTaskId: grade.courseTaskId,
    actionType: ActionType.Delete,
    previousState: grade,
  });

  res.sendStatus(HttpCode.Ok);
};

/**
 * (UserIdArray) => LatestGrades
 *
 * @throws ApiError(404)
 */
export const getLatestGrades: Endpoint<UserIdArray, LatestGrades> = async (
  req,
  res
) => {
  const dbUsers = await User.findAll({where: {id: req.body}});
  if (dbUsers.length < req.body.length)
    throw new ApiError('Some user ids not found', HttpCode.NotFound);

  const dbGrades = await TaskGrade.findAll({
    where: {userId: req.body},
    group: ['userId'],
    attributes: [
      'userId',
      [sequelize.fn('MAX', sequelize.col('date')), 'date'],
    ],
    raw: true,
  });
  const latestGrades: LatestGrades = dbGrades.map(item => ({
    userId: item.userId,
    date: new Date(item.date),
  }));

  const missingStudents = new Set<number>(req.body);
  for (const grade of latestGrades) missingStudents.delete(grade.userId);
  for (const userId of missingStudents) {
    latestGrades.push({userId: userId, date: null});
  }

  res.json(latestGrades);
};
