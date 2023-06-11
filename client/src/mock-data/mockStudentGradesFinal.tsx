// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockStudentGradesFinal = [
  {
    '1': 3,
    '2': 2,
    '3': 3,
    'studentNumber': '754787',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 5,
    '3': 5,
    'studentNumber': '189659',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 1,
    '3': 3,
    'studentNumber': '342499',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 2,
    '3': 3,
    'studentNumber': '829295',
    'finalGrade': 3
  },
  {
    '1': 3,
    '2': 4,
    '3': 4,
    'studentNumber': '383823',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 3,
    '3': 1,
    'studentNumber': '653421',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 2,
    '3': 2,
    'studentNumber': '174964',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 1,
    '3': 2,
    'studentNumber': '628883',
    'finalGrade': 5
  },
  {
    '1': 3,
    '2': 4,
    '3': 2,
    'studentNumber': '813869',
    'finalGrade': 1
  },
  {
    '1': 2,
    '2': 2,
    '3': 2,
    'studentNumber': '362275',
    'finalGrade': 3
  },
  {
    '1': 5,
    '2': 5,
    '3': 1,
    'studentNumber': '368723',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 5,
    '3': 4,
    'studentNumber': '255746',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 1,
    '3': 3,
    'studentNumber': '383691',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 3,
    '3': 3,
    'studentNumber': '165912',
    'finalGrade': 1
  },
  {
    '1': 2,
    '2': 3,
    '3': 2,
    'studentNumber': '252685',
    'finalGrade': 1
  },
  {
    '1': 1,
    '2': 1,
    '3': 2,
    'studentNumber': '412379',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 1,
    '3': 2,
    'studentNumber': '143228',
    'finalGrade': 2
  },
  {
    '1': 5,
    '2': 4,
    '3': 1,
    'studentNumber': '113456',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 4,
    '3': 1,
    'studentNumber': '179845',
    'finalGrade': 3
  },
  {
    '1': 1,
    '2': 5,
    '3': 2,
    'studentNumber': '159597',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 5,
    '3': 3,
    'studentNumber': '332522',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 4,
    '3': 3,
    'studentNumber': '288979',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 4,
    '3': 3,
    'studentNumber': '229889',
    'finalGrade': 3
  },
  {
    '1': 5,
    '2': 4,
    '3': 2,
    'studentNumber': '146745',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 5,
    '3': 5,
    'studentNumber': '614927',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 2,
    '3': 3,
    'studentNumber': '713598',
    'finalGrade': 3
  },
  {
    '1': 5,
    '2': 5,
    '3': 2,
    'studentNumber': '925725',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 2,
    '3': 5,
    'studentNumber': '957762',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 5,
    '3': 4,
    'studentNumber': '568237',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 4,
    '3': 4,
    'studentNumber': '344594',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 1,
    '3': 1,
    'studentNumber':'517418',
    'finalGrade': 4
  },
  {
    '1': 1,
    '2': 1,
    '3': 3,
    'studentNumber': '553796',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 1,
    '3': 2,
    'studentNumber': '861812',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 5,
    '3': 4,
    'studentNumber': '884396',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 5,
    '3': 4,
    'studentNumber': '776995',
    'finalGrade': 5
  },
  {
    '1': 2,
    '2': 1,
    '3': 4,
    'studentNumber': '765712',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 1,
    '3': 1,
    'studentNumber': '319877',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 4,
    '3': 2,
    'studentNumber': '244216',
    'finalGrade': 1
  },
  {
    '1': 1,
    '2': 3,
    '3': 3,
    'studentNumber': '137118',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 2,
    '3': 5,
    'studentNumber': '185676',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 5,
    '3': 5,
    'studentNumber': '243949',
    'finalGrade': 3
  },
  {
    '1': 4,
    '2': 4,
    '3': 3,
    'studentNumber': '435694',
    'finalGrade': 1
  },
  {
    '1': 3,
    '2': 1,
    '3': 3,
    'studentNumber': '451722',
    'finalGrade': 4
  },
  {
    '1': 5,
    '2': 1,
    '3': 5,
    'studentNumber': '111235',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 2,
    '3': 1,
    'studentNumber': '186234',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 2,
    '3': 4,
    'studentNumber': '122634',
    'finalGrade': 5
  },
  {
    '1': 2,
    '2': 3,
    '3': 4,
    'studentNumber': '561726',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 4,
    '3': 2,
    'studentNumber': '439542',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 4,
    '3': 1,
    'studentNumber': '843632',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 3,
    '3': 5,
    'studentNumber': '518493',
    'finalGrade': 1
  },
  {
    '1': 3,
    '2': 3,
    '3': 3,
    'studentNumber': '472634',
    'finalGrade': 3
  },
  {
    '1': 1,
    '2': 2,
    '3': 4,
    'studentNumber': '649315',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 5,
    '3': 3,
    'studentNumber': '268531',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 1,
    '3': 5,
    'studentNumber': '218754',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 3,
    '3': 5,
    'studentNumber': '763587',
    'finalGrade': 4
  },
  {
    '1': 1,
    '2': 2,
    '3': 4,
    'studentNumber': '199429',
    'finalGrade': 2
  },
  {
    '1': 5,
    '2': 5,
    '3': 2,
    'studentNumber': '388837',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 5,
    '3': 2,
    'studentNumber': '347382',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 2,
    '3': 5,
    'studentNumber': '286325',
    'finalGrade': 4
  },
  {
    '1': 1,
    '2': 2,
    '3': 3,
    'studentNumber': '997214',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 5,
    '3': 5,
    'studentNumber': '581153',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 3,
    '3': 4,
    'studentNumber': '562142',
    'finalGrade': 4
  },
  {
    '1': 2,
    '2': 1,
    '3': 2,
    'studentNumber': '188547',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 1,
    '3': 1,
    'studentNumber': '745765',
    'finalGrade': 4
  },
  {
    '1': 5,
    '2': 5,
    '3': 3,
    'studentNumber': '645825',
    'finalGrade': 4
  },
  {
    '1': 5,
    '2': 3,
    '3': 5,
    'studentNumber': '158329',
    'finalGrade': 3
  }
];

export default mockStudentGradesFinal;
