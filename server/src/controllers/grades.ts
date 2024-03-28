// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {stringify} from 'csv-stringify';
import {NextFunction, Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {Includeable, Op, QueryTypes, Transaction} from 'sequelize';
import * as yup from 'yup';
import {z} from 'zod';

import {
  AttainmentGradeData,
  AttainmentGradesData,
  EditGrade,
  FinalGradeData,
  GradeOption,
  GradeType,
  HttpCode,
  Language,
  NewGrade,
  Status,
  StudentGradesTree,
  StudentRow,
} from '@common/types';
import {sequelize} from '../database';
import AssessmentModel from '../database/models/assessmentModel';
import Attainment from '../database/models/attainment';
import AttainmentGrade from '../database/models/attainmentGrade';
import Course from '../database/models/course';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {
  ApiError,
  AttainmentGradeModelData,
  JwtClaims,
  StudentGrades,
  idSchema,
} from '../types';
import {validateAssessmentModelPath} from './utils/assessmentModel';
import {findAttainmentById, findAttainmentGradeById} from './utils/attainment';
import {findAndValidateCourseId} from './utils/course';
import {toDateOnlyString} from './utils/date';
import {getDateOfLatestGrade} from './utils/grades';
import {findUserById, isTeacherInChargeOrAdmin} from './utils/user';

const studentNumbersExist = async (studentNumbers: string[]): Promise<void> => {
  const foundStudentNumbers = (
    await User.findAll({
      attributes: ['studentNumber'],
      where: {
        studentNumber: {[Op.in]: studentNumbers},
      },
    })
  ).map(student => student.studentNumber);

  if (foundStudentNumbers.length !== studentNumbers.length) {
    const errors: string[] = [];

    for (const studentNumber of studentNumbers) {
      if (!foundStudentNumbers.includes(studentNumber)) {
        errors.push(`user with student number ${studentNumber} not found`);
      }
    }

    throw new ApiError(errors, HttpCode.UnprocessableEntity);
  }
};

export async function getCsvTemplate(
  req: Request,
  res: Response
): Promise<void> {
  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId,
      req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    course.id,
    HttpCode.Forbidden
  );

  const attainmentNames: Array<string> = (
    await Attainment.findAll({
      attributes: ['name'],
      where: {
        courseId: course.id,
      },
    })
  ).map((attainment: {name: string}) => attainment.name);

  if (attainmentNames.length === 0) {
    throw new ApiError(
      `no attainments found for assessment model with ID ${assessmentModel.id}, ` +
        'add attainments to the assessment model to generate a template',
      HttpCode.NotFound
    );
  }

  const template: Array<Array<string>> = [
    ['StudentNumber', ...attainmentNames],
  ];

  stringify(
    template,
    {
      delimiter: ',',
    },
    (_err: unknown, data: string) => {
      res
        .status(HttpCode.Ok)
        .setHeader('Content-Type', 'text/csv')
        .attachment(`course_${course.courseCode}_grading_template.csv`)
        .send(data);
      return;
    }
  );
}

/**
 * Get all course grades
 * @param {Request} req - The HTTP request.
 * @param {Response} res - The HTTP response containing the CSV file.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If course and/or course instance not found, instance does not belong to
 * the course, or no course results found/calculated before calling the endpoint.
 */
export async function getGrades(req: Request, res: Response): Promise<void> {
  // const urlParams: yup.AnyObjectSchema = yup.object({
  //   studentNumbers: yup.array().json().of(yup.string()).notRequired(),
  //   instanceId: yup.number().min(1).notRequired(),
  // });

  // const {
  //   studentNumbers,
  //   instanceId,
  // }: {
  //   studentNumbers?: Array<string>;
  //   instanceId?: number;
  // } = await urlParams.validate(req.query, {abortEarly: false});

  const courseId = Number(req.params.courseId);

  // Get all attainments for the course
  const attainments: Array<Attainment> = await Attainment.findAll({
    where: {
      courseId: courseId,
    },
  });
  // Get grades of all attainments
  const grades = await AttainmentGrade.findAll({
    include: {
      all: true,
    },
    where: {
      attainmentId: {
        [Op.in]: attainments.map((attainment: Attainment) => attainment.id),
      },
    },
  });

  //Get finalGrades for all students
  const finalGrades = await FinalGrade.findAll({
    include: {
      all: true,
    },
    where: {
      courseId: courseId,
    },
  });

  // From the grades list -> dict of unique Users, key userId
  const users = grades.reduce<{[key: string]: User}>((acc, grade) => {
    if (grade.User && !acc[grade.User.id]) {
      acc[grade.User.id] = grade.User;
    }
    return acc;
  }, {});

  // Grades dict, composition: user id:attainment id=list of grades
  const userGrades = grades.reduce<{
    [key: string]: {[key: string]: AttainmentGrade[]};
  }>((acc, grade) => {
    const userId = grade.userId;
    if (!acc[userId]) {
      acc[userId] = {};
    }
    if (!acc[userId][grade.attainmentId]) {
      acc[userId][grade.attainmentId] = [];
    }
    acc[userId][grade.attainmentId].push(grade);
    return acc;
  }, {});

  // FinalGrades dict, composition: user id=list of final grades
  const finalGradesDict = finalGrades.reduce<{
    [key: string]: FinalGrade[];
  }>((acc, grade) => {
    const userId = grade.userId;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(grade);
    return acc;
  }, {});

  //Cleaning the results for API response

  const result = Object.keys(userGrades).map(userId => {
    const gradeToAdd: StudentRow = {
      user: {
        id: users[userId].id,
        studentNumber: users[userId].studentNumber,
      },
      finalGrades: finalGradesDict[userId]?.map(fGrade => {
        const fGradeToAdd: FinalGradeData = {
          userId: fGrade.userId,
          courseId: fGrade.courseId,
          assessmentModelId: fGrade.assessmentModelId,
          graderId: fGrade.graderId,
          grade: fGrade.grade,
          date: fGrade.date,
          sisuExportDate: fGrade.sisuExportDate,
        };
        return fGradeToAdd;
      }),
      attainments: attainments.map(attainment => {
        const attToAdd: AttainmentGradesData = {
          attainmentId: attainment.id,
          attainmentName: attainment.name,
          grades: userGrades[userId][attainment.id]?.map(grade => {
            const gradeOption: GradeOption = {
              gradeId: grade.id,
              grader: {
                id: grade.grader!.id,
                name: grade?.grader?.name,
                studentNumber: '',
              },
              grade: grade.grade,
              exportedToSisu: grade.sisuExportDate,
              date: grade.date ? toDateOnlyString(grade.date) : undefined,
              expiryDate: grade.expiryDate
                ? toDateOnlyString(grade.expiryDate)
                : undefined,
              comment: grade.comment,
            };
            return gradeOption;
          }),
        };
        return attToAdd;
      }),
    };
    return gradeToAdd;
  });

  res.status(HttpCode.Ok).json({
    data: result,
  });
}

/**
 * The final grade for a student in a form returned by a database query.
 */
interface FinalGradeRaw extends AttainmentGrade {
  grader: User;
}

async function getFinalGradesFor(
  studentNumbers: string[],
  skipErrorOnEmpty: boolean = false
): Promise<FinalGrade[]> {
  // Prepare base query options for User.
  const userQueryOptions: Includeable = {
    model: User,
    attributes: ['id', 'studentNumber'],
  };

  // Conditionally add a where clause if student numbers are included in the
  // function call
  if (studentNumbers.length !== 0) {
    userQueryOptions.where = {
      studentNumber: {
        [Op.in]: studentNumbers,
      },
    };
  }

  const finalGrades = await FinalGrade.findAll({
    include: [
      {
        model: User,
        required: true,
        as: 'grader',
        attributes: ['id', 'name'],
      },
      userQueryOptions,
    ],
    order: [['id', 'ASC']],
  });

  if (finalGrades.length === 0 && !skipErrorOnEmpty) {
    throw new ApiError(
      'no grades found, make sure grades have been ' +
        'uploaded/calculated before requesting course results',
      HttpCode.NotFound
    );
  }

  return finalGrades;
}

export const SisuCSVSchema = z.object({
  assessmentDate: z.string().datetime().optional(), // Assesment date override
  // All Sisu accepted language codes.
  completionLanguage: z.nativeEnum(Language).optional(), // Defaults to course language TODO: confirm that the Language enum is valid for SISU
  studentNumbers: z.array(z.string()).nonempty(),
});
export type SisuCSVBody = z.infer<typeof SisuCSVSchema>;

/**
 * Get grading data formatted to Sisu compatible format for exporting grades to Sisu.
 * Documentation and requirements for Sisu CSV file structure available at
 * https://wiki.aalto.fi/display/SISEN/Assessment+of+implementations
 * @param {Request} req - The HTTP request.
 * @param {Response} res - The HTTP response containing the CSV file.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If course and/or course instance not found, instance does not belong to
 * the course, or no course results found/calculated before calling the endpoint.
 */
export async function getSisuFormattedGradingCSV(
  req: Request<ParamsDictionary, unknown, SisuCSVBody>,
  res: Response
): Promise<void> {
  const sisuExportDate = new Date();
  const course = await findAndValidateCourseId(req.params.courseId);

  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    course.id,
    HttpCode.Forbidden
  );

  await studentNumbersExist(req.body.studentNumbers);

  /**
   * TODO: only one grade per user per instance is allowed
   */
  const finalGrades = await getFinalGradesFor(req.body.studentNumbers);

  type SisuCsvFormat = {
    studentNumber: string;
    grade: string;
    credits: number;
    assessmentDate: string;
    completionLanguage: string;
    comment: string;
  };

  type MarkSisuExport = {gradeId: number; userId: number};

  const courseResults: SisuCsvFormat[] = [];
  const exportedToSisu: MarkSisuExport[] = [];

  for (const finalGrade of finalGrades) {
    if (finalGrade.User === undefined) {
      console.error(
        'Final grade found with no matching user even though student nubmers were validated'
      );
      continue;
    }
    const existingResult = courseResults.find(
      value => value.studentNumber === finalGrade.User?.studentNumber
    );

    if (existingResult) {
      if (finalGrade.grade <= parseInt(existingResult.grade)) continue; // TODO: Maybe more options than just best grade
      existingResult.grade = finalGrade.grade.toString(); // TODO: Confirm that finalgrade.grade is valid

      // There can be multiple grades, make sure only the exported grade is marked with timestamp.
      const userData = exportedToSisu.find(
        value => value.userId === finalGrade.User?.id
      );
      if (userData) userData.gradeId = finalGrade.id;
    } else {
      exportedToSisu.push({gradeId: finalGrade.id, userId: finalGrade.userId});

      courseResults.push({
        studentNumber: finalGrade.User.studentNumber,
        // Round to get final grades as an integer.
        grade: String(Math.round(finalGrade.grade)),
        credits: course.maxCredits,
        // Assesment date must be in form dd.mm.yyyy.
        // HERE we want to find the latest completed attainment grade for student
        assessmentDate: (req.body.assessmentDate
          ? new Date(req.body.assessmentDate)
          : await getDateOfLatestGrade(finalGrade.userId, course.id)
        ).toLocaleDateString('fi-FI'),
        completionLanguage: req.body.completionLanguage
          ? req.body.completionLanguage
          : course.languageOfInstruction, // TODO: Confirm that is in lower case
        // Comment column is required, but can be empty.
        comment: '', // finalGrade.comment, TODO: Add comment to finalGrade DB table
      });
    }
  }

  await FinalGrade.update(
    {sisuExportDate},
    {
      where: {
        id: {
          [Op.or]: exportedToSisu.map(value => value.gradeId),
        },
      },
    }
  );

  stringify(
    courseResults,
    {
      header: true,
      delimiter: ',', // NOTE, accepted delimiters in Sisu are semicolon ; and comma ,
    },
    (_err, data) => {
      res
        .status(HttpCode.Ok)
        .setHeader('Content-Type', 'text/csv')
        .attachment(
          `final_grades_course_${
            course.courseCode
          }_${new Date().toLocaleDateString('fi-FI')}.csv`
        )
        .send(data);
    }
  );
}

// /**
//  * Get course instance final grading data in JSON format.
//  * @param {Request} req - The HTTP request.
//  * @param {Response} res - The HTTP response containing the CSV file.
//  * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
//  * @throws {ApiError} - If course and/or course instance not found, instance does not belong to
//  * the course, or no course results found/calculated before calling the endpoint.
//  */
// export async function getFinalGrades(
//   req: Request,
//   res: Response
// ): Promise<void> {
//   const urlParams: yup.AnyObjectSchema = yup.object({
//     studentNumbers: yup.array().json().of(yup.string()).notRequired(),
//     instanceId: yup.number().min(1).notRequired(),
//   });

//   const {
//     studentNumbers,
//     instanceId,
//   }: {
//     studentNumbers?: Array<string>;
//     instanceId?: number;
//   } = await urlParams.validate(req.query, {abortEarly: false});

//   const [course, assessmentModel]: [Course, AssessmentModel] =
//     await validateAssessmentModelPath(
//       req.params.courseId,
//       req.params.assessmentModelId
//     );

//   await isTeacherInChargeOrAdmin(
//     req.user as JwtClaims,
//     course.id,
//     HttpCode.Forbidden
//   );

//   interface IdAndStudentNumber {
//     userId: number;
//     studentNumber: string;
//   }

//   // Raw query to enable distinct selection of students who have at least one
//   // grade for any attainment in an assessment model.
//   let students: Array<IdAndStudentNumber> = (
//     await sequelize.query(
//       `SELECT DISTINCT "user".id AS id, student_number
//        FROM attainment_grade
//        INNER JOIN attainment ON attainment.id = attainment_grade.attainment_id
//        INNER JOIN "user" ON "user".id = attainment_grade.user_id
//        WHERE attainment.assessment_model_id = :assessmentModelId`,
//       {
//         replacements: {assessmentModelId: assessmentModel.id},
//         type: QueryTypes.SELECT,
//       }
//     )
//   )
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     .map((value: any) => {
//       return {
//         userId: value.id,
//         studentNumber: value.student_number,
//       };
//     });

//   // Include students from a particular instance if an ID provided.
//   const filter: Array<string> | undefined = instanceId
//     ? await filterByInstanceAndStudentNumber(instanceId, studentNumbers)
//     : studentNumbers;

//   if (filter) {
//     await studentNumbersExist(filter);

//     students = students.filter((student: IdAndStudentNumber) => {
//       return (filter as Array<string>).includes(student.studentNumber);
//     });
//   }

//   const finalGrades: Array<FinalGrade> = [];

//   const rawFinalGrades: Array<FinalGradeRaw> = await getFinalGradesFor(
//     assessmentModel.id,
//     students.map((student: IdAndStudentNumber) => student.studentNumber),
//     true
//   );

//   for (const student of students) {
//     finalGrades.push({
//       userId: student.userId,
//       studentNumber: student.studentNumber,
//       credits: course.maxCredits,
//       grades: rawFinalGrades
//         .filter((grade: FinalGradeRaw) => grade.User?.id === student.userId)
//         .map((grade: FinalGradeRaw): GradeOption => {
//           return {
//             gradeId: grade.id,
//             grader: {
//               id: grade.grader.id,
//               name: grade.grader.name,
//             },
//             grade: Math.round(grade.grade),
//             status: grade.status as Status,
//             manual: grade.manual ?? true,
//             exportedToSisu: grade.sisuExportDate,
//             date: grade.date ? toDateOnlyString(grade.date) : undefined,
//             comment: grade.comment ?? '',
//           };
//         }),
//     });
//   }

//   res.status(HttpCode.Ok).json({
//     data: finalGrades,
//   });
// }

/**
 * Get course instance final grading data in JSON format.
 * @param {Request} req - The HTTP request.
 * @param {Response} res - The HTTP response containing the CSV file.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If course and/or course instance not found, instance does not belong to
 * the course, or no course results found/calculated before calling the endpoint.
 */
export async function getGradeTreeOfAllUsers(
  req: Request,
  res: Response
): Promise<void> {
  const urlParams: yup.AnyObjectSchema = yup.object({
    studentNumbers: yup.array().json().of(yup.string()).notRequired(),
    instanceId: yup.number().min(1).notRequired(),
  });

  const {
    studentNumbers,
    instanceId,
  }: {
    studentNumbers?: Array<string>;
    instanceId?: number;
  } = await urlParams.validate(req.query, {abortEarly: false});

  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId,
      req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    course.id,
    HttpCode.Forbidden
  );

  interface IdAndStudentNumber {
    userId: number;
    studentNumber: string;
  }

  // Raw query to enable distinct selection of students who have at least one
  // grade for any attainment in an assessment model.
  let students: Array<IdAndStudentNumber> = (
    await sequelize.query(
      `SELECT DISTINCT "user".id AS id, student_number
       FROM attainment_grade
       INNER JOIN attainment ON attainment.id = attainment_grade.attainment_id
       INNER JOIN "user" ON "user".id = attainment_grade.user_id
       WHERE attainment.assessment_model_id = :assessmentModelId`,
      {
        replacements: {assessmentModelId: assessmentModel.id},
        type: QueryTypes.SELECT,
      }
    )
  )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((value: any) => {
      return {
        userId: value.id,
        studentNumber: value.student_number,
      };
    });

  // Include students from a particular instance if an ID provided.
  const filter = studentNumbers;

  if (filter) {
    await studentNumbersExist(filter);

    students = students.filter((student: IdAndStudentNumber) => {
      return filter.includes(student.studentNumber);
    });
  }

  //// Calculating attainments for all students ////
  // Types & Init
  type AttainmentWithUserGrade = Attainment & {
    AttainmentGrades: Array<AttainmentGrade>;
  };
  const finalData: StudentGradesTree[] = [];

  // Function for generating the attainment tree for a student
  function generateAttainmentTreeWithUserGrades(
    userGrades: AttainmentWithUserGrade[],
    id?: number
  ): AttainmentGradeData {
    const root: AttainmentWithUserGrade | undefined = userGrades.find(
      (attainment: AttainmentWithUserGrade) => {
        return id ? attainment.id === id : !attainment.id; //broken code
      }
    );

    if (!root) {
      throw new ApiError(
        `failed to find attainment with id ${id} in grade tree generation`,
        HttpCode.InternalServerError
      );
    }

    const children = userGrades.filter(
      (attainment: AttainmentWithUserGrade) => attainment.id === root.id //broken code
    );

    return {
      attainmentId: root.id,
      attainmentName: root.name,
      grades: root.AttainmentGrades.map(
        (option: AttainmentGrade): GradeOption => {
          return {
            gradeId: option.id,
            grader: {
              id: option.grader!.id,
              name: option.grader?.name,
              studentNumber: '',
            },
            grade: option.grade,
            exportedToSisu: option.sisuExportDate,
            date: option.date ? toDateOnlyString(option.date) : undefined,
            expiryDate: option.expiryDate
              ? toDateOnlyString(option.expiryDate)
              : undefined,
            comment: option.comment ?? '',
          };
        }
      ),
      subAttainments: children.map((attainment: AttainmentWithUserGrade) => {
        return generateAttainmentTreeWithUserGrades(userGrades, attainment.id);
      }),
    };
  }

  for (const student of students) {
    // Get the list of grades
    const userGrades: Array<AttainmentWithUserGrade> =
      (await Attainment.findAll({
        where: {
          courseId: course.id,
        },
        include: [
          {
            model: AttainmentGrade,
            required: false,
            where: {
              userId: student.userId,
            },
            include: [
              {
                model: User,
                required: true,
                as: 'grader',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      })) as Array<AttainmentWithUserGrade>;

    // Calculate Tree and create student object
    finalData.push({
      userId: student.userId,
      studentNumber: student.studentNumber,
      credits: course.maxCredits,
      ...generateAttainmentTreeWithUserGrades(userGrades), // Unpacking so that the we have a first level grades and subAttainments
    });
  }

  res.status(HttpCode.Ok).json({
    data: finalData,
  });
}

export async function getGradeTreeOfUser(
  req: Request,
  res: Response
): Promise<void> {
  const userId: number = (
    await idSchema.validate({id: req.params.userId}, {abortEarly: false})
  ).id;

  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId,
      req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    course.id,
    HttpCode.Forbidden
  );
  await findUserById(userId, HttpCode.NotFound);

  interface AttainmentWithUserGrade extends Attainment {
    AttainmentGrades: Array<AttainmentGrade>;
  }

  const userGrades: Array<AttainmentWithUserGrade> = (await Attainment.findAll({
    where: {
      courseId: course.id,
    },
    include: [
      {
        model: AttainmentGrade,
        required: false,
        where: {
          userId,
        },
        include: [
          {
            model: User,
            required: true,
            as: 'grader',
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  })) as Array<AttainmentWithUserGrade>;

  res.status(HttpCode.Ok).json({
    data: {}, //broken code
  });
}

/**
 * Parse and extract attainment IDs from the CSV file header.
 * Correct format: "StudentNumber,exam,exercise,project,..."
 * @param {Array<string>} header - Header part of the CSV file.
 * @param {number} assessmentModelId - ID of the assessment model grades are
 * being added to.
 * @returns {Promise<Array<Attainment>>} - Array containing the attainments
 * from the header.
 * @throws {ApiError} - If first column not "StudentNumber" (case-insensitive)
 * header array is empty or any of the attainment names are malformed or missing.
 */
export async function parseHeaderFromCsv(
  header: Array<string>,
  courseId: number
): Promise<Array<Attainment>> {
  const errors: Array<string> = [];

  // Remove first input "StudentNumber". Avoid using shift(), which will have
  // side-effects outside this function.
  const attainmentNames: Array<string> = header.slice(1);

  if (attainmentNames.length === 0) {
    throw new ApiError(
      'No attainments found from the header, please upload valid CSV.',
      HttpCode.BadRequest
    );
  }

  const attainments: Array<Attainment> = await Attainment.findAll({
    where: {
      [Op.and]: [
        {
          courseId: courseId,
        },
        {
          name: {
            [Op.in]: attainmentNames,
          },
        },
      ],
    },
  });

  if (attainmentNames.length > attainments.length) {
    for (const attainmentName of attainmentNames) {
      if (
        !attainments.find(
          (attainment: Attainment) => attainment.name === attainmentName
        )
      ) {
        errors.push(
          'Header attainment data parsing failed at column ' +
            `${attainmentNames.indexOf(attainmentName) + 2}. ` +
            `Could not find an attainment with name ${attainmentName} in ` +
            `assessment model with ID ${courseId}.`
        );
      }
    }
  }

  // If any column parsing fails, throw error with invalid column info.
  if (errors.length > 0) {
    throw new ApiError(errors, HttpCode.BadRequest);
  }
  return attainments;
}

/**
 * Parses student grading data from a CSV file and creates an array of Student objects.
 * @param {Array<Array<string>>} studentGradingData - Body part of the CSV file.
 * @param {Array<Attainment>} attainments - Array of attainments corresponding to each grade column.
 * @returns {Array<Student>} - Array of Student objects containing their student number and
 * an array of their grades.
 * @throws {ApiError} - If there is an error in the CSV file (e.g. incorrect data type in a cell).
 * Collects all errors found to an array, does not throw error immediately on first incorrect value.
 */
export function parseGradesFromCsv(
  studentGradingData: Array<Array<string>>,
  attainments: Array<Attainment>
): Array<StudentGrades> {
  const students: Array<StudentGrades> = [];
  const errors: Array<string> = [];

  /**
   * currentRow and currentColumn are user facing row and column numbers of the
   * uploaded CSV file. They are the index of the row and column plus 1,
   * so the first row and column in the CSV file will have the index 0 but the
   * number 1. See an example of row and column numbers below.
   *
   *        | column 1      | column 2 | column 3 |
   *  ---------------------------------------------
   *  row 1:| StudentNumber | exercise | exam     |
   *  row 2:| 812472        | 12       | 32       |
   *  row 3:| 545761        | 0        | 15       |
   *  ...
   *  row n:| ...
   *
   * currentRow is incremented after a row has been parsed, currentColumn is
   * incremented after a column of a row has been parsed and is reset to 2
   * when the current row has been fully parsed.
   *
   * Row and column 1 are handled separately.
   */
  let currentRow: number = 2;
  let currentColumn: number = 2;

  for (const row of studentGradingData) {
    const studentNumber: string = row[0];
    const gradingData: Array<string> = row.slice(1);

    const student: StudentGrades = {
      studentNumber,
      grades: [],
    };

    for (let i: number = 0; i < attainments.length; i++) {
      if (isNaN(Number(gradingData[i]))) {
        errors.push(
          `CSV file row ${currentRow} column ${currentColumn}` +
            ` expected number, received "${gradingData[i]}"`
        );
        currentColumn++;
        continue;
      }

      const gradeValue: number = parseFloat(gradingData[i]);

      if (gradeValue < 0) {
        errors.push(
          `CSV file row ${currentRow} column ${currentColumn}` +
            ` uploaded grade "${gradeValue}" can't be negative`
        );
        currentColumn++;
        continue;
      }

      currentColumn++;
    }

    // Reset column number to 2 for parsing the next row.
    currentColumn = 2;
    currentRow++;
    students.push(student);
  }

  // If any row parsing fails, throw error with invalid row info.
  if (errors.length > 0) {
    throw new ApiError(errors, HttpCode.BadRequest);
  }
  return students;
}

const gradeTypeErrors: Array<string> = [];

function correctType(
  grade: AttainmentGradeModelData,
  studentNumber: string
): number {
  // Grade is supposed to be integer but received float.
  if (grade.gradeType === GradeType.Integer && !Number.isInteger(grade.grade)) {
    gradeTypeErrors.push(
      'Expected grade type integer but received float ' +
        `for student ${studentNumber} grade name '${grade.attainmentName}'.`
    );
  }
  return grade.gradeType === GradeType.Integer
    ? Math.round(grade.grade)
    : grade.grade;
}

// /**
//  * Asynchronously adds grades from a CSV file to the database.
//  * @param {Request} req - The HTTP request containing the CSV file.
//  * @param {Response} res - The HTTP response to be sent to the client.
//  * @param {NextFunction} next - The next middleware function to be executed in the pipeline.
//  * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
//  * @throws {ApiError} - If CSV file loading fails, parsing the header or body of the CSV fails, or
//  * the CSV file contains attainments which don't belong to the specified course or course instance.
//  */
// export async function addGrades(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> {
//   const requestSchema: yup.AnyObjectSchema = yup
//     .object()
//     .shape({
//       completionDate: yup.date().required(),
//       expiryDate: yup.date().notRequired(),
//     })
//     .test(
//       (value: {
//         completionDate: yup.Maybe<Date>;
//         expiryDate?: yup.Maybe<Date | undefined>;
//       }) => {
//         if (
//           value.completionDate &&
//           value.expiryDate &&
//           value.completionDate.getTime() > value.expiryDate.getTime()
//         ) {
//           throw new ApiError(
//             'Expiry date cannot be before completion date.',
//             HttpCode.BadRequest
//           );
//         }
//         return true;
//       }
//     );

//   const {
//     completionDate,
//     expiryDate,
//   }: {
//     completionDate: Date;
//     expiryDate?: Date;
//   } = await requestSchema.validate(req.body, {abortEarly: false});

//   /** TODO: Check grading points are not higher than max points of the attainment. */
//   const grader: JwtClaims = req.user as JwtClaims;

//   // Validation path parameters.
//   const [course, assessmentModel]: [Course, AssessmentModel] =
//     await validateAssessmentModelPath(
//       req.params.courseId,
//       req.params.assessmentModelId
//     );

//   await isTeacherInChargeOrAdmin(grader, course.id, HttpCode.Forbidden);

//   if (!req?.file) {
//     throw new ApiError(
//       'CSV file not found in the request. To upload CSV file, set input field name as "csv_data"',
//       HttpCode.BadRequest
//     );
//   }

//   // Convert CSV to string for the parser.
//   const data: string = req.file.buffer.toString();

//   // Array for collecting CSV row data.
//   const studentGradingData: Array<Array<string>> = [];

//   // TODO: should user be allowed to define delimiter in the request.
//   const parser: Parser = parse({
//     delimiter: ',',
//   });

//   parser
//     .on('readable', (): void => {
//       let row: Array<string>;
//       while ((row = parser.read()) !== null) {
//         studentGradingData.push(row);
//       }
//     })
//     .on('error', next) // Stream causes uncaught exception, pass error manually to the errorHandler.
//     .on('end', async (): Promise<void> => {
//       try {
//         // Header having colum information, e.g., "StudentNumber,exam,exercise,project,..."
//         const header: Array<string> =
//           studentGradingData.shift() as Array<string>;

//         // Parse header and grades separately. Always first parse header before
//         // parsing the grades as the grade parser needs the attainment id array.
//         const attainments: Array<Attainment> = await parseHeaderFromCsv(
//           header,
//           assessmentModel.id
//         );

//         let parsedStudentData: Array<StudentGrades> = parseGradesFromCsv(
//           studentGradingData,
//           attainments
//         );

//         // Check all users (students) exists in db, create new users if needed.
//         const studentNumbers: Array<string> = parsedStudentData.map(
//           (student: StudentGrades) => student.studentNumber
//         );

//         let students: Array<User> = await User.findAll({
//           attributes: ['id', 'studentNumber'],
//           where: {
//             studentNumber: {
//               [Op.in]: studentNumbers,
//             },
//           },
//         });

//         const foundStudents: Array<string> = students.map(
//           (student: User) => student.studentNumber
//         );
//         const nonExistingStudents: Array<string> = studentNumbers.filter(
//           (id: string) => !foundStudents.includes(id)
//         );

//         await sequelize.transaction(async (t: Transaction) => {
//           // Create new users (students) if any found from the CSV.
//           if (nonExistingStudents.length > 0) {
//             const newUsers: Array<User> = await User.bulkCreate(
//               nonExistingStudents.map((studentNumber: string) => {
//                 return {
//                   studentNumber: studentNumber,
//                 };
//               }),
//               {transaction: t}
//             );
//             students = students.concat(newUsers);
//           }
//         });

//         // At this point all students confirmed to exist in the database.

//         // Add users' database IDs to parsedStudentData based on student number.
//         parsedStudentData = parsedStudentData.map(
//           (student: StudentGrades): StudentGrades => {
//             const matchingUser: User = students.find(
//               (user: User) =>
//                 user.dataValues.studentNumber === student.studentNumber
//             ) as User;

//             return {
//               ...student,
//               id: matchingUser.id,
//             };
//           }
//         );

//         // Use studentsWithId to update attainments by flatmapping each
//         // students grades into a one array of all the grades.
//         const preparedBulkCreate: Array<AttainmentGradeModelData> =
//           parsedStudentData.flatMap(
//             (student: StudentGrades): Array<AttainmentGradeModelData> => {
//               const studentNumber: string = student.studentNumber;
//               const studentGradingData: Array<AttainmentGradeModelData> =
//                 student.grades.map(
//                   (
//                     grade: AttainmentGradeModelData
//                   ): AttainmentGradeModelData => {
//                     return {
//                       ...grade,
//                       userId: student.id as number,
//                       graderId: grader.id,
//                       date: completionDate,
//                       expiryDate: expiryDate,
//                       grade: correctType(grade, studentNumber),
//                     };
//                   }
//                 );
//               return studentGradingData;
//             }
//           );

//         if (gradeTypeErrors.length !== 0) {
//           throw new ApiError(gradeTypeErrors, HttpCode.BadRequest);
//         }

//         // TODO: Optimize if datasets are big.
//         await AttainmentGrade.bulkCreate(preparedBulkCreate);

//         // After this point all the students' attainment grades have been created or
//         // updated in the database.

//         res.status(HttpCode.Ok).json({
//           data: {},
//         });
//         return;
//       } catch (err: unknown) {
//         next(err);
//       }
//     });

//   // Write stringified CSV data to the csv-parser's stream.
//   parser.write(data);

//   // Close the readable stream once data reading finished.
//   parser.end();
// }

export async function editUserGrade(
  req: Request,
  res: Response
): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    grade: yup.number().min(0).notRequired(),
    status: yup.string().oneOf(Object.values(Status)).notRequired(),
    date: yup.date().notRequired(),
    expiryDate: yup.date().notRequired(),
    comment: yup.string().notRequired(),
  });

  const {grade, status, date, expiryDate, comment}: EditGrade =
    await requestSchema.validate(req.body, {abortEarly: false});

  const gradeId: number = (
    await idSchema.validate({id: req.params.gradeId}, {abortEarly: false})
  ).id;

  const grader: JwtClaims = req.user as JwtClaims;

  const [course]: [Course, AssessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assessmentModelId
  );

  await isTeacherInChargeOrAdmin(grader, course.id, HttpCode.Forbidden);

  const gradeData: AttainmentGrade = await findAttainmentGradeById(
    gradeId,
    HttpCode.NotFound
  );

  if (grade) {
    const attainment: Attainment = await findAttainmentById(
      gradeData.attainmentId,
      HttpCode.NotFound
    );
  }

  await gradeData
    .set({
      grade: grade ?? gradeData.grade,
      status: status ?? gradeData.status,
      date: date ?? gradeData.date,
      expiryDate: expiryDate ?? gradeData.expiryDate,
      comment: comment && comment.length > 0 ? comment : gradeData.comment,
      manual: true,
      graderId: grader.id,
    })
    .save();

  res.status(HttpCode.Ok).json({
    data: {},
  });
}

export async function addGrades(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const newGrades = req.body.grades as unknown as NewGrade[];

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
    const preparedBulkCreate: Array<AttainmentGradeModelData> = newGrades.map(
      gradeEntry => {
        return {
          userId: studentsNumberToId[gradeEntry.studentNumber],
          attainmentId: gradeEntry.attainmentId,
          graderId: grader.id,
          date: gradeEntry.date,
          expiryDate: gradeEntry.expiryDate,
          grade: gradeEntry.grade,

          // status: gradeEntry.status,
          // manual: true,
          // gradeType: gradeEntry.gradeType,
        };
      }
    );

    if (gradeTypeErrors.length !== 0) {
      throw new ApiError(gradeTypeErrors, HttpCode.BadRequest);
    }

    // TODO: Optimize if datasets are big.
    await AttainmentGrade.bulkCreate(preparedBulkCreate);

    // After this point all the students' attainment grades have been created

    res.status(HttpCode.Ok).json({
      data: {},
    });
    return;
  } catch (err: unknown) {
    next(err);
  }
}
