// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Op} from 'sequelize';

import {
  ActionType,
  CourseRoleType,
  type EditWaitListEntry,
  HttpCode,
  type NewWaitListEntry,
  type WaitListEntryData,
  type WaitListImportEntry,
  type WaitListEntryIdArray,
  type WaitListRelease,
  WaitListStatus,
} from '@/common/types';
import {sequelize} from '../database';
import CourseRole from '../database/models/courseRole';
import TaskGrade from '../database/models/taskGrade';
import TaskGradeLog from '../database/models/taskGradeLog';
import User from '../database/models/user';
import WaitListEntry from '../database/models/waitListEntry';
import {
  ApiError,
  type Endpoint,
  type JwtClaims,
  type NewDbTaskGradeLogData,
} from '../types';
import {validateCourseId} from './utils/course';
import {validateCourseTaskBelongsToCourse} from './utils/courseTask';
import {studentNumbersExist} from './utils/finalGrade';

const parseWaitListEntry = (entry: WaitListEntry): WaitListEntryData => {
  if (entry.User === undefined) {
    throw new ApiError('Wait list entry missing user', HttpCode.InternalServerError);
  }
  if (entry.User.studentNumber === null) {
    throw new ApiError(
      'Wait list entry user missing student number',
      HttpCode.InternalServerError
    );
  }

  return {
    id: entry.id,
    courseId: entry.courseId,
    user: {
      id: entry.User.id,
      name: entry.User.name,
      email: entry.User.email,
      studentNumber: entry.User.studentNumber,
    },
    reason: entry.reason ?? null,
    dateAdded: new Date(entry.dateAdded),
    dateResolved: entry.dateResolved === null ? null : new Date(entry.dateResolved),
    status: entry.status,
  };
};

const normalizeStatus = (
  status: WaitListStatus | null | undefined
): WaitListStatus => status ?? WaitListStatus.Pending;

const normalizeDateResolved = (
  status: WaitListStatus,
  dateResolved: Date | string | null | undefined
): Date | null => {
  if (status === WaitListStatus.Pending) return null;
  if (dateResolved === undefined || dateResolved === null) return new Date();
  return typeof dateResolved === 'string' ? new Date(dateResolved) : dateResolved;
};

const resolveUsersByStudentNumber = async (
  studentNumbers: string[]
): Promise<Map<string, User>> => {
  await studentNumbersExist(studentNumbers);

  const users = await User.findAll({
    where: {studentNumber: {[Op.in]: studentNumbers}},
  });

  return new Map(
    users
      .filter(user => user.studentNumber !== null)
      .map(user => [user.studentNumber as string, user])
  );
};

/**
 * () => WaitListEntryData[]
 *
 * @throws ApiError(400|404)
 */
export const getWaitList: Endpoint<void, WaitListEntryData[]> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);

  const entries = await WaitListEntry.findAll({
    where: {courseId},
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
    ],
    order: [
      ['dateAdded', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  res.json(entries.map(parseWaitListEntry));
};

/**
 * (NewWaitListEntry[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const addWaitListEntries: Endpoint<NewWaitListEntry[], void> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);
  const studentNumbers = req.body.map(entry => entry.studentNumber);
  const usersByStudentNumber = await resolveUsersByStudentNumber(studentNumbers);
  const studentNumberByUserId = new Map(
    Array.from(usersByStudentNumber.values()).map(user => [
      user.id,
      user.studentNumber as string,
    ])
  );

  const userIds = Array.from(usersByStudentNumber.values()).map(user => user.id);
  const pendingEntries = await WaitListEntry.findAll({
    where: {
      courseId,
      userId: {[Op.in]: userIds},
      status: WaitListStatus.Pending,
    },
  });

  if (pendingEntries.length > 0) {
    const pendingStudentNumbers = pendingEntries
      .map(entry => studentNumberByUserId.get(entry.userId))
      .filter((value): value is string => value !== undefined);
    throw new ApiError(
      `Pending wait list entries already exist for ${pendingStudentNumbers.join(', ')}`,
      HttpCode.Conflict
    );
  }

  const preparedEntries = req.body.map((entry) => {
    const user = usersByStudentNumber.get(entry.studentNumber);
    if (user === undefined) {
      throw new ApiError(
        `User with student number ${entry.studentNumber} not found`,
        HttpCode.NotFound
      );
    }

    const status = normalizeStatus(entry.status);
    return {
      courseId,
      userId: user.id,
      reason: entry.reason ?? null,
      dateAdded: entry.dateAdded ?? new Date(),
      dateResolved: normalizeDateResolved(status, entry.dateResolved),
      status,
    };
  });

  await WaitListEntry.bulkCreate(preparedEntries);
  res.sendStatus(HttpCode.Created);
};

const updateEntry = (
  entry: WaitListEntry,
  update: EditWaitListEntry
): void => {
  const status = normalizeStatus(update.status ?? entry.status);
  const dateAdded = update.dateAdded ?? entry.dateAdded;
  const dateResolved = normalizeDateResolved(
    status,
    update.dateResolved ?? entry.dateResolved
  );

  entry.set({
    reason: update.reason ?? entry.reason,
    dateAdded,
    dateResolved,
    status,
  });
};

/**
 * (EditWaitListEntry[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const editWaitListEntries: Endpoint<EditWaitListEntry[], void> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);
  const entryIds = req.body.map(entry => entry.id);

  const entries = await WaitListEntry.findAll({
    where: {id: {[Op.in]: entryIds}},
  });

  if (entries.length !== entryIds.length) {
    throw new ApiError('Some wait list entries were not found', HttpCode.NotFound);
  }

  const entriesById = new Map(entries.map(entry => [entry.id, entry]));

  await sequelize.transaction(async (transaction) => {
    for (const update of req.body) {
      const entry = entriesById.get(update.id);
      if (entry === undefined) continue;
      if (entry.courseId !== courseId) {
        throw new ApiError(
          `Wait list entry ${entry.id} does not belong to course ${courseId}`,
          HttpCode.Conflict
        );
      }
      updateEntry(entry, update);
      await entry.save({transaction});
    }
  });

  res.sendStatus(HttpCode.Ok);
};

/**
 * (WaitListImportEntry[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const importWaitListEntries: Endpoint<WaitListImportEntry[], void> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);
  const studentNumbers = req.body.map(entry => entry.studentNumber);
  const usersByStudentNumber = await resolveUsersByStudentNumber(studentNumbers);

  await sequelize.transaction(async (transaction) => {
    for (const entry of req.body) {
      const user = usersByStudentNumber.get(entry.studentNumber);
      if (user === undefined) {
        throw new ApiError(
          `User with student number ${entry.studentNumber} not found`,
          HttpCode.NotFound
        );
      }

      let waitListEntry: WaitListEntry | null = null;
      if (entry.entryId !== null && entry.entryId !== undefined) {
        waitListEntry = await WaitListEntry.findByPk(entry.entryId, {
          transaction,
        });
        if (waitListEntry && waitListEntry.courseId !== courseId) {
          throw new ApiError(
            `Wait list entry ${entry.entryId} does not belong to course ${courseId}`,
            HttpCode.Conflict
          );
        }
      }

      waitListEntry ??= await WaitListEntry.findOne({
        where: {
          courseId,
          userId: user.id,
          status: WaitListStatus.Pending,
        },
        transaction,
      });

      if (waitListEntry === null) {
        const status = normalizeStatus(entry.status);
        await WaitListEntry.create(
          {
            courseId,
            userId: user.id,
            reason: entry.reason ?? null,
            dateAdded: entry.dateAdded ?? new Date(),
            dateResolved: normalizeDateResolved(status, entry.dateResolved),
            status,
          },
          {transaction}
        );
      } else {
        updateEntry(waitListEntry, {
          id: waitListEntry.id,
          reason: entry.reason,
          dateAdded: entry.dateAdded,
          dateResolved: entry.dateResolved,
          status: entry.status,
        });
        await waitListEntry.save({transaction});
      }
    }
  });

  res.sendStatus(HttpCode.Ok);
};

/**
 * (WaitListRelease) => void
 *
 * @throws ApiError(400|404|409)
 */
export const releaseWaitListEntries: Endpoint<WaitListRelease, void> = async (
  req,
  res
) => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);
  const {entryIds, status, dateResolved, manualGrade} = req.body;

  const entries = await WaitListEntry.findAll({
    where: {id: {[Op.in]: entryIds}},
  });

  if (entries.length !== entryIds.length) {
    throw new ApiError('Some wait list entries were not found', HttpCode.NotFound);
  }

  await sequelize.transaction(async (transaction) => {
    for (const entry of entries) {
      if (entry.courseId !== courseId) {
        throw new ApiError(
          `Wait list entry ${entry.id} does not belong to course ${courseId}`,
          HttpCode.Conflict
        );
      }
      entry.set({
        status,
        dateResolved: normalizeDateResolved(status, dateResolved),
      });
      await entry.save({transaction});
    }

    if (manualGrade !== null && manualGrade !== undefined) {
      await validateCourseTaskBelongsToCourse(courseId, manualGrade.courseTaskId);

      const createdGrades: TaskGrade[] = [];
      for (const entry of entries) {
        const existingGrade = await TaskGrade.findOne({
          where: {
            userId: entry.userId,
            courseTaskId: manualGrade.courseTaskId,
            aplusGradeSourceId: null,
          },
          transaction,
        });

        if (existingGrade) {
          await existingGrade
            .set({
              grade: manualGrade.grade,
              date: new Date(),
              expiryDate: null,
              graderId: grader.id,
              comment: manualGrade.comment ?? null,
            })
            .save({transaction});
        } else {
          const created = await TaskGrade.create(
            {
              userId: entry.userId,
              courseTaskId: manualGrade.courseTaskId,
              graderId: grader.id,
              aplusGradeSourceId: null,
              grade: manualGrade.grade,
              date: new Date(),
              expiryDate: null,
              comment: manualGrade.comment ?? null,
            },
            {transaction}
          );
          createdGrades.push(created);
        }
      }

      if (createdGrades.length > 0) {
        const logs: NewDbTaskGradeLogData[] = createdGrades.map(taskGrade => ({
          userId: grader.id,
          courseTaskId: taskGrade.courseTaskId,
          taskGradeId: taskGrade.id,
          actionType: ActionType.Create,
          previousState: taskGrade,
        }));
        await TaskGradeLog.bulkCreate(logs, {transaction});
      }

      const studentUserIds = entries.map(entry => entry.userId);
      const existingRoles = await CourseRole.findAll({
        attributes: ['userId'],
        where: {
          courseId,
          userId: {[Op.in]: studentUserIds},
          role: CourseRoleType.Student,
        },
        transaction,
      });
      const usersWithRole = new Set(existingRoles.map(role => role.userId));
      const missingRoles = studentUserIds.filter(
        userId => !usersWithRole.has(userId)
      );
      if (missingRoles.length > 0) {
        await CourseRole.bulkCreate(
          missingRoles.map(userId => ({
            courseId,
            userId,
            role: CourseRoleType.Student,
          })),
          {transaction}
        );
      }
    }
  });

  res.sendStatus(HttpCode.Ok);
};

/**
 * (number[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const deleteWaitListEntries: Endpoint<WaitListEntryIdArray, void> = async (
  req,
  res
) => {
  const courseId = await validateCourseId(req.params.courseId);
  const entryIds = req.body;

  const entries = await WaitListEntry.findAll({
    where: {id: {[Op.in]: entryIds}},
  });

  if (entries.length !== entryIds.length) {
    throw new ApiError('Some wait list entries were not found', HttpCode.NotFound);
  }

  await sequelize.transaction(async (transaction) => {
    for (const entry of entries) {
      if (entry.courseId !== courseId) {
        throw new ApiError(
          `Wait list entry ${entry.id} does not belong to course ${courseId}`,
          HttpCode.Conflict
        );
      }
      await entry.destroy({transaction});
    }
  });

  res.sendStatus(HttpCode.Ok);
};
