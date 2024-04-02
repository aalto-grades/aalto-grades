// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {NextFunction, Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {z} from 'zod';

import {HttpCode} from '@common/types';
import FinalGrade from '../database/models/finalGrade';
import {JwtClaims} from '../types';
import {FinalGradeModelData} from '../types/finalGrade';
import {validateCourseId} from './utils/course';
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

// TODO: use zod in global type definition
export const addFinalGradesBodySchema = z.object({
  finalGrades: z.array(
    z.object({
      userId: z.number().int(),
      assessmentModelId: z.number().int(),
      grade: z.number().int().min(0).max(5),
      date: z.string().datetime().optional(),
    })
  ),
});
export type addFinalGradesBody = z.infer<typeof addFinalGradesBodySchema>;

export const addFinalGrades = async (
  req: Request<ParamsDictionary, unknown, addFinalGradesBody>,
  res: Response
): Promise<void | Response> => {
  const newGrades = req.body.finalGrades;
  const grader = req.user as JwtClaims;

  const courseId = await validateCourseId(req.params.courseId);
  await isTeacherInChargeOrAdmin(grader, courseId);

  const preparedBulkCreate: FinalGradeModelData[] = newGrades.map(
    gradeEntry => ({
      userId: gradeEntry.userId,
      assessmentModelId: gradeEntry.assessmentModelId,
      courseId: courseId,
      graderId: grader.id,
      date:
        gradeEntry.date !== undefined ? new Date(gradeEntry.date) : undefined,
      grade: gradeEntry.grade,
    })
  );

  // TODO: Optimize if datasets are big.
  await FinalGrade.bulkCreate(preparedBulkCreate);

  // After this point all the students' attainment grades have been created
  return res.status(HttpCode.Ok).json({data: {}});
};

export async function getFinalGrades(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const courseId = Number(req.params.courseId);
  const grader: JwtClaims = req.user as JwtClaims;

  await isTeacherInChargeOrAdmin(grader, courseId);

  try {
    const finalGrades = await FinalGrade.findAll({
      where: {
        courseId: courseId,
      },
    });

    return res.status(HttpCode.Ok).json({data: finalGrades});
  } catch (err: unknown) {
    next(err);
  }
}
