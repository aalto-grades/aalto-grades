// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parseGradesFromCsv, parseHeaderFromCsv } from '../../src/controllers/grades';
import { ApiError } from '../../src/types/error';
import { StudentGrades, UserAttainmentGradeData } from '../../src/types/grades';
import { HttpCode } from '../../src/types/httpCode';

function checkError(error: unknown, httpCode: HttpCode, message: string | Array<string>): void {
  expect(error).toBeInstanceOf(ApiError);
  if (error instanceof ApiError) {
    expect(error.statusCode).toBe(httpCode);
    expect(error.message).toBe(typeof message === 'string' ? message : '');
    if (error.multipleErrors) {
      expect(error.multipleErrors).toStrictEqual(message);
    }
  }
}

describe('Test CSV header parser', () => {

  it('should parse correctly formatted header of attainment CSV file', () => {
    let result: Array<number> = parseHeaderFromCsv(
      ['StudentNo', 'C3I9A1', 'C3I9A2', 'C3I9A3', 'C3I9A4', 'C3I9A5']
    );
    expect(result.length).toBe(5);
    expect(result).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();

    result = parseHeaderFromCsv(
      ['STUDENTNO', 'C33I9A1', 'C33I9A2', 'C33I9A3', 'C33I9A4', 'C33I9A5']
    );
    expect(result.length).toBe(5);
    expect(result).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();

    result = parseHeaderFromCsv(
      ['studentno', 'C3I69A11', 'C3I69A22', 'C3I69A33', 'C3I69A44', 'C3I69A55']
    );
    expect(result.length).toBe(5);
    expect(result).toEqual(expect.arrayContaining([11, 22, 33, 44, 55]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();

    result = parseHeaderFromCsv(
      ['studentno', 'C3I69A1']
    );
    expect(result.length).toBe(1);
    expect(result).toEqual(expect.arrayContaining([1]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();
  });

  it('should throw error if parsing fails due to invalid header column', () => {
    try {
      // Third column bad, attainment id not a number.
      parseHeaderFromCsv(['StudentN0', 'A3R9A1', 'C3I9Ax', 'CYI9A4']);


    } catch (error: unknown) {
      console.log(error);
      checkError(
        error,
        HttpCode.BadRequest,
        [
          'Header attainment data parsing failed at column 3.' +
          ' Expected attainment id to type of number, received string.'
        ]
      );
    }

    try {
      parseHeaderFromCsv(['StudentNo', 'C3I9A1', 'C3I9A2', 'C3I9Axx']); // Last column bad.
    } catch (error: unknown) {
      checkError(
        error,
        HttpCode.BadRequest,
        [
          'Header attainment data parsing failed at column 4.' +
          ' Expected attainment id to type of number, received string.'
        ]
      );
    }

    try {
      parseHeaderFromCsv(['StudentNo', 'C3I9At', 'C3I9B&', 'C3I9A3xx']); // Multiple columns bad.
    } catch (error: unknown) {
      checkError(
        error,
        HttpCode.BadRequest,
        [
          'Header attainment data parsing failed at column 2.' +
          ' Expected attainment id to type of number, received string.',
          'Header attainment data parsing failed at column 3.' +
          ' Expected attainment id to type of number, received string.',
          'Header attainment data parsing failed at column 4.' +
          ' Expected attainment id to type of number, received string.'
        ]
      );
    }
  });

  it('should throw error if parsing fails due to having only the first header column',() => {
    try {
      parseHeaderFromCsv(['StudentN0']);
    } catch (error: unknown) {
      checkError(
        error,
        HttpCode.BadRequest,
        'No attainments found from the header, please upload valid CSV.'
      );
    }
  });
});

describe('Test CSV student grades parser', () => {

  it('should parse correctly formatted grades in the CSV file', () => {
    const studentGradingData: Array<Array<string>> = [
      [ '111111', '12', '32', '3', '3', '7' ],
      [ '222222', '0', '15', '2', '3', '18' ],
      [ '333333', '6', '9', '43', '0', '0' ],
      [ '444444', '36', '3', '6', '2', '8' ],
      [ '555555', '12', '0', '7', '6', '13' ],
      [ '666666', '16', '4', '0', '15', '2' ]
    ];
    const attainmentIds: Array<number> = [1, 2, 3, 4, 5];
    const result: Array<StudentGrades> = parseGradesFromCsv(studentGradingData, attainmentIds);

    result.forEach((student: StudentGrades, index: number) => {
      const rowData: Array<string> = studentGradingData[index];
      expect(student.studentNumber).toBe(rowData[0]);

      student.grades.forEach((grade: UserAttainmentGradeData, index: number) => {
        expect(grade.attainableId).toBe(attainmentIds[index]);
        expect(grade.points).toBe(Number(rowData[index + 1]));
      });
    });
    expect(result.length).toBe(6);
  });

  it('should throw error if parsing fails due to one non-numeric grading value', () => {
    const studentGradingData: Array<Array<string>> = [
      [ '111111', '12', '32', '3', '3', '7' ],
      [ '222222', '0', '15', '2', '3', '18' ],
      [ '333333', '6', '9', 'XXXX', '0', '0' ],
      [ '444444', '36', '3', '6', '2', '8' ],
      [ '555555', '12', '0', '7', '6', '13' ],
      [ '666666', '16', '4', '0', '15', '2' ]
    ];
    const attainmentIds: Array<number> = [1, 2, 3, 4, 5];

    try {
      parseGradesFromCsv(studentGradingData, attainmentIds);
    } catch (error: unknown) {
      checkError(
        error,
        HttpCode.BadRequest,
        ['CSV file row 4 column 4 expected number, received "XXXX"']
      );
    }
  });

  it('should throw error if parsing fails due to multiple non-numeric grading value', () => {
    const studentGradingData: Array<Array<string>> = [
      [ '111111', '12', '32', '3', '3', 'ZZZZ' ],
      [ '222222', '0', '15', '2', '3', '18' ],
      [ '333333', '6', '9', 'XXXX', '0', '0' ],
      [ '444444', 'YYYY', '3', '6', '2', '8' ],
      [ '555555', '12', '0', '7', '6', '13' ],
      [ '666666', '16', 'AAAA', '0', '15', '2' ]
    ];
    const attainmentIds: Array<number> = [1, 2, 3, 4, 5];

    try {
      parseGradesFromCsv(studentGradingData, attainmentIds);
    } catch (error: unknown) {
      checkError(
        error,
        HttpCode.BadRequest,
        [
          'CSV file row 2 column 6 expected number, received "ZZZZ"',
          'CSV file row 4 column 4 expected number, received "XXXX"',
          'CSV file row 5 column 2 expected number, received "YYYY"',
          'CSV file row 7 column 3 expected number, received "AAAA"'
        ]
      );
    }
  });
});
