import { Status } from 'aalto-grades-common/types';
import { FinalGrade } from '../../types';

export const finalGrades: Array<FinalGrade> = [
  {
    id: 1,
    studentNumber: '12345A',
    grade: Status.Pass,
    credits: 5
  },
  {
    id: 2,
    studentNumber: '98745A',
    grade: Status.Pass,
    credits: 5
  },
  {
    id: 3,
    studentNumber: '12859A',
    grade: Status.Pass,
    credits: 5
  }
];
