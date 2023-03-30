// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parseGrades, parseHeader } from '../../src/controllers/grades';
import { ApiError } from '../../src/types/error';
import { Grade, Student } from '../../src/types/grades';
import { HttpCode } from '../../src/types/httpCode';

describe('Test CSV header parser', () => {

  it('should parse correctly formatted header of attainment CSV file', () => {
    let result: Array<number> = parseHeader(
      ['StudentNo', 'C3I9A1', 'C3I9A2', 'C3I9A3', 'C3I9A4', 'C3I9A5']
    );
    expect(result.length).toBe(5);
    expect(result).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();

    result = parseHeader(
      ['STUDENTNO', 'C33I9A1', 'C33I9A2', 'C33I9A3', 'C33I9A4', 'C33I9A5']
    );
    expect(result.length).toBe(5);
    expect(result).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();

    result = parseHeader(
      ['studentno', 'C3I69A11', 'C3I69A22', 'C3I69A33', 'C3I69A44', 'C3I69A55']
    );
    expect(result.length).toBe(5);
    expect(result).toEqual(expect.arrayContaining([11, 22, 33, 44, 55]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();

    result = parseHeader(
      ['studentno', 'C3I69A1']
    );
    expect(result.length).toBe(1);
    expect(result).toEqual(expect.arrayContaining([1]));
    expect(result.every((value: number) => !isNaN(value))).toBeTruthy();
  });

  it('should throw error if parsing fails due to invalid header column', () => {

    // First column bad
    expect(() => parseHeader(['StudentN0', 'C3I9A1', 'C3I9A2', 'C3I9A3'])).toThrowError(
      new ApiError(
        '',
        HttpCode.BadRequest,
        ['CSV parse error, header row column 1 must be "StudentNo", received "StudentN0"']
      )
    );

    // Third column bad.
    expect(() => parseHeader(['StudentNo', 'C3I9A1', 'C3I9B2', 'C3I9A3'])).toThrowError(
      new ApiError(
        '',
        HttpCode.BadRequest,
        // eslint-disable-next-line max-len
        ['Header attainment data parsing failed at column 3. Use format C{courseId}I{courseInstanceId}A{attainmentId}.']
      )
    );

    // Last column bad.
    expect(() => parseHeader(['StudentNo', 'C3I9A1', 'C3I9A2', 'C3I9A3xx'])).toThrowError(
      new ApiError(
        '',
        HttpCode.BadRequest,
        // eslint-disable-next-line max-len
        ['Header attainment data parsing failed at column 4. Use format C{courseId}I{courseInstanceId}A{attainmentId}.']
      )
    );

    // Multiple columns bad.
    expect(() => parseHeader(['StudentN0', 'C3I9A1', 'C3I9B2', 'C3I9A3xx'])).toThrowError(
      new ApiError(
        '',
        HttpCode.BadRequest,
        [
          'CSV parse error, header row column 1 must be "StudentNo", received "StudentN0"',
          // eslint-disable-next-line max-len
          'Header attainment data parsing failed at column 3. Use format C{courseId}I{courseInstanceId}A{attainmentId}.',
          // eslint-disable-next-line max-len
          'Header attainment data parsing failed at column 4. Use format C{courseId}I{courseInstanceId}A{attainmentId}.'
        ]
      )
    );
  });

  it('should throw error if parsing fails due to having only the first header column',() => {
    expect(() => parseHeader(['StudentNo'])).toThrowError(
      new ApiError(
        'No attainments found from the header, please upload valid CSV.',
        HttpCode.BadRequest
      )
    );
  });

  it('should throw error if parsing fails due to header being empty array',() => {
    expect(() => parseHeader([])).toThrowError(
      new ApiError('CSV file header empty, please upload valid CSV.', HttpCode.BadRequest)
    );
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
    const result: Array<Student> = parseGrades(studentGradingData, attainmentIds);

    result.forEach((student: Student, index: number) => {
      const rowData: Array<string> = studentGradingData[index];
      expect(student.studentNumber).toBe(rowData[0]);

      student.grades.forEach((grade: Grade, index: number) => {
        expect(grade.attainmentId).toBe(attainmentIds[index]);
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

    expect(() => parseGrades(studentGradingData, attainmentIds)).toThrowError(
      new ApiError(
        '',
        HttpCode.BadRequest,
        ['CSV file row 4 column 4 expected number, received "XXXX"']
      )
    );
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

    expect(() => parseGrades(studentGradingData, attainmentIds)).toThrowError(
      new ApiError(
        '',
        HttpCode.BadRequest,
        [
          'CSV file row 2 column 6 expected number, received "ZZZZ"',
          'CSV file row 4 column 4 expected number, received "XXXX"',
          'CSV file row 5 column 2 expected number, received "YYYY"',
          'CSV file row 7 column 3 expected number, received "AAAA"',
        ]
      )
    );
  });
});
