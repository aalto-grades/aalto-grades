// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {HttpCode, NewFinalGrade} from '@common/types';
import {NextFunction, Request, Response} from 'express';
import {Op, Transaction} from 'sequelize';

import {sequelize} from '../database';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {JwtClaims} from '../types';
import {FinalGradeModelData} from '../types/finalGrade';
import {isTeacherInChargeOrAdmin} from './utils/user';

// type Input = {
//   valuesList: Array<{
//     user: {
//       studentNumber: string;
//     };
//     attainments: Array<{
//       attainmentId: string;
//       grades: Array<{
//         grade: number | null;
//       }>;
//     }>;
//   }>;
//   date: string;
//   expiryDate: string;
//   assessmentModel: AssessmentModel;
// };

// export async function calculateFinalGrades(
//   req: Request,
//   res: Response
// ): Promise<void> {
//   //   const requestSchema: yup.AnyObjectSchema = yup.object().shape({
//   //     grade: yup.number().min(0).notRequired(),
//   //     date: yup.date().notRequired(),
//   //     expiryDate: yup.date().notRequired(),
//   //     comment: yup.string().notRequired(),
//   //     assessmentModel:
//   //   });

//   const {valuesList, date, expiryDate, assessmentModel}: Input =
//     await requestSchema.validate(req.body, {abortEarly: false});

//   const calculatedGrades = batchCalculateGraph(
//     assessmentModel.graphStructure!,
//     valuesList.map(row => {
//       return {
//         studentNumber: row.user.studentNumber!,
//         attainments: row.attainments.map(att => ({
//           attainmentId: att.attainmentId,
//           grade: att.grades[0].grade ?? 0, //🐛 best grade should be taken
//         })),
//       };
//     })
//   );

//     // Add the calculated grades to the database
//     const preparedBulkCreate: Array<FinalGradeModelData> = newGrades.map(
//         gradeEntry => {
//           return {
//             userId: studentsNumberToId[gradeEntry.studentNumber],
//             attainmentId: gradeEntry.attainmentId,
//             graderId: grader.id,
//             date: gradeEntry.date,
//             expiryDate: gradeEntry.expiryDate,
//             grade: gradeEntry.grade,

//             // status: gradeEntry.status,
//             // manual: true,
//             // gradeType: gradeEntry.gradeType,
//           };
//         }
//       );

//   res.status(HttpCode.Ok).json({
//     data: result,
//   });
// }

export async function addFinalGrades(
  req: Request,
  res: Response,
  next: NextFunction
) {
  //Needs to be validated
  const newGrades = req.body.grades as unknown as NewFinalGrade[];

  const grader: JwtClaims = req.user as JwtClaims;

  // Validation path parameters.
  const courseId = Number(req.params.courseId);

  await isTeacherInChargeOrAdmin(grader, courseId, HttpCode.Forbidden);

  try {
    // Check all users (students) exists in db, create new users if needed.
    // Make sure each studentNumber is only in the list once
    const studentNumbers = Array.from(
      new Set(newGrades.map(grade => grade.studentNumber))
    );

    let students = await User.findAll({
      attributes: ['id', 'studentNumber'],
      where: {
        studentNumber: {
          [Op.in]: studentNumbers,
        },
      },
    });
    const foundStudents = students.map(student => student.studentNumber);
    const nonExistingStudents = studentNumbers.filter(
      id => !foundStudents.includes(id)
    );

    await sequelize.transaction(async (t: Transaction) => {
      // Create new users (students) if any found from the CSV.
      if (nonExistingStudents.length > 0) {
        const newUsers: Array<User> = await User.bulkCreate(
          nonExistingStudents.map((studentNumber: string) => {
            return {
              studentNumber: studentNumber,
            };
          }),
          {transaction: t}
        );
        students = students.concat(newUsers);
      }
    });

    // All students now exists in the database.
    students = await User.findAll({
      attributes: ['id', 'studentNumber'],
      where: {
        studentNumber: {
          [Op.in]: studentNumbers,
        },
      },
    });

    const studentsNumberToId = students.reduce(
      (
        obj: {
          [key: string]: number;
        },
        student
      ) => {
        obj[student.studentNumber] = student.id;
        return obj;
      },
      {}
    );

    // Use studentsWithId to update attainments by flatmapping each
    // students grades into a one array of all the grades.
    const preparedBulkCreate: Array<FinalGradeModelData> = newGrades.map(
      gradeEntry => {
        return {
          userId: studentsNumberToId[gradeEntry.studentNumber],
          assessmentModelId: gradeEntry.assessmentModelId ?? null,
          courseId: courseId,
          graderId: grader.id,
          date: gradeEntry.date,
          grade: gradeEntry.grade,
        };
      }
    );

    // TODO: Optimize if datasets are big.
    await FinalGrade.bulkCreate(preparedBulkCreate);

    // After this point all the students' attainment grades have been created

    res.status(HttpCode.Ok).json({
      data: {},
    });
    return;
  } catch (err: unknown) {
    next(err);
  }
}
