// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {HttpCode, NewFinalGrade} from '@common/types';
import {NextFunction, Request, Response} from 'express';

import FinalGrade from '../database/models/finalGrade';
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
  // TODO: Needs to be validated
  const newGrades = req.body.finalGrades as NewFinalGrade[];

  const grader: JwtClaims = req.user as JwtClaims;

  // Validation path parameters.
  const courseId = Number(req.params.courseId);

  await isTeacherInChargeOrAdmin(grader, courseId, HttpCode.Forbidden);

  try {
    // Use studentsWithId to update attainments by flatmapping each
    // students grades into a one array of all the grades.
    const preparedBulkCreate: FinalGradeModelData[] = newGrades.map(
      gradeEntry => ({
        userId: gradeEntry.userId,
        assessmentModelId: gradeEntry.assessmentModelId ?? null,
        courseId: courseId,
        graderId: grader.id,
        date: gradeEntry.date,
        grade: gradeEntry.grade,
      })
    );

    // TODO: Optimize if datasets are big.
    await FinalGrade.bulkCreate(preparedBulkCreate);

    // After this point all the students' attainment grades have been created

    return res.status(HttpCode.Ok).json({data: {}});
  } catch (err: unknown) {
    next(err);
  }
}
