// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockStudentGrades = [
  {
    '1': 3,
    '2': 2,
    '3': 3,
    'studentID': '754787',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 5,
    '3': 5,
    'studentID': '189659',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 1,
    '3': 3,
    'studentID': '342499',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 2,
    '3': 3,
    'studentID': '829295',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 4,
    '3': 4,
    'studentID': '383823',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 3,
    '3': 1,
    'studentID': '653421',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 2,
    '3': 2,
    'studentID': '174964',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 1,
    '3': 2,
    'studentID': '628883',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 4,
    '3': 2,
    'studentID': '813869',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 2,
    '3': 2,
    'studentID': '362275',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 5,
    '3': 1,
    'studentID': '368723',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 5,
    '3': 4,
    'studentID': '255746',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 1,
    '3': 3,
    'studentID': '383691',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 3,
    '3': 3,
    'studentID': '165912',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 3,
    '3': 2,
    'studentID': '252685',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 1,
    '3': 2,
    'studentID': '412379',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 1,
    '3': 2,
    'studentID': '143228',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 4,
    '3': 1,
    'studentID': '113456',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 4,
    '3': 1,
    'studentID': '179845',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 5,
    '3': 2,
    'studentID': '159597',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 5,
    '3': 3,
    'studentID': '332522',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 4,
    '3': 3,
    'studentID': '288979',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 4,
    '3': 3,
    'studentID': '229889',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 4,
    '3': 2,
    'studentID': '146745',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 5,
    '3': 5,
    'studentID': '614927',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 2,
    '3': 3,
    'studentID': '713598',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 5,
    '3': 2,
    'studentID': '925725',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 2,
    '3': 5,
    'studentID': '957762',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 5,
    '3': 4,
    'studentID': '568237',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 4,
    '3': 4,
    'studentID': '344594',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 1,
    '3': 1,
    'studentID':'517418',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 1,
    '3': 3,
    'studentID': '553796',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 1,
    '3': 2,
    'studentID': '861812',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 5,
    '3': 4,
    'studentID': '884396',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 5,
    '3': 4,
    'studentID': '776995',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 1,
    '3': 4,
    'studentID': '765712',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 1,
    '3': 1,
    'studentID': '319877',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 4,
    '3': 2,
    'studentID': '244216',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 3,
    '3': 3,
    'studentID': '137118',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 2,
    '3': 5,
    'studentID': '185676',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 5,
    '3': 5,
    'studentID': '243949',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 4,
    '3': 3,
    'studentID': '435694',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 1,
    '3': 3,
    'studentID': '451722',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 1,
    '3': 5,
    'studentID': '111235',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 2,
    '3': 1,
    'studentID': '186234',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 2,
    '3': 4,
    'studentID': '122634',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 3,
    '3': 4,
    'studentID': '561726',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 4,
    '3': 2,
    'studentID': '439542',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 4,
    '3': 1,
    'studentID': '843632',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 3,
    '3': 5,
    'studentID': '518493',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 3,
    '3': 3,
    'studentID': '472634',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 2,
    '3': 4,
    'studentID': '649315',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 5,
    '3': 3,
    'studentID': '268531',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 1,
    '3': 5,
    'studentID': '218754',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 3,
    '3': 5,
    'studentID': '763587',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 2,
    '3': 4,
    'studentID': '199429',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 5,
    '3': 2,
    'studentID': '388837',
    'finalGrade': undefined
  },
  {
    '1': 3,
    '2': 5,
    '3': 2,
    'studentID': '347382',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 2,
    '3': 5,
    'studentID': '286325',
    'finalGrade': undefined
  },
  {
    '1': 1,
    '2': 2,
    '3': 3,
    'studentID': '997214',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 5,
    '3': 5,
    'studentID': '581153',
    'finalGrade': undefined
  },
  {
    '1': 4,
    '2': 3,
    '3': 4,
    'studentID': '562142',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 1,
    '3': 2,
    'studentID': '188547',
    'finalGrade': undefined
  },
  {
    '1': 2,
    '2': 1,
    '3': 1,
    'studentID': '745765',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 5,
    '3': 3,
    'studentID': '645825',
    'finalGrade': undefined
  },
  {
    '1': 5,
    '2': 3,
    '3': 5,
    'studentID': '158329',
    'finalGrade': undefined
  }
];
  
export default mockStudentGrades;