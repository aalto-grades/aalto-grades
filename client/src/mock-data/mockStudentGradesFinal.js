// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const mockStudentGradesFinal = [
  {
    '1': 3,
    '2': 2,
    '3': 3,
    'studentID': '754787',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 5,
    '3': 5,
    'studentID': '189659',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 1,
    '3': 3,
    'studentID': '342499',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 2,
    '3': 3,
    'studentID': '829295',
    'finalGrade': 3
  },
  {
    '1': 3,
    '2': 4,
    '3': 4,
    'studentID': '383823',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 3,
    '3': 1,
    'studentID': '653421',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 2,
    '3': 2,
    'studentID': '174964',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 1,
    '3': 2,
    'studentID': '628883',
    'finalGrade': 5
  },
  {
    '1': 3,
    '2': 4,
    '3': 2,
    'studentID': '813869',
    'finalGrade': 1
  },
  {
    '1': 2,
    '2': 2,
    '3': 2,
    'studentID': '362275',
    'finalGrade': 3
  },
  {
    '1': 5,
    '2': 5,
    '3': 1,
    'studentID': '368723',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 5,
    '3': 4,
    'studentID': '255746',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 1,
    '3': 3,
    'studentID': '383691',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 3,
    '3': 3,
    'studentID': '165912',
    'finalGrade': 1
  },
  {
    '1': 2,
    '2': 3,
    '3': 2,
    'studentID': '252685',
    'finalGrade': 1
  },
  {
    '1': 1,
    '2': 1,
    '3': 2,
    'studentID': '412379',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 1,
    '3': 2,
    'studentID': '143228',
    'finalGrade': 2
  },
  {
    '1': 5,
    '2': 4,
    '3': 1,
    'studentID': '113456',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 4,
    '3': 1,
    'studentID': '179845',
    'finalGrade': 3
  },
  {
    '1': 1,
    '2': 5,
    '3': 2,
    'studentID': '159597',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 5,
    '3': 3,
    'studentID': '332522',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 4,
    '3': 3,
    'studentID': '288979',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 4,
    '3': 3,
    'studentID': '229889',
    'finalGrade': 3
  },
  {
    '1': 5,
    '2': 4,
    '3': 2,
    'studentID': '146745',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 5,
    '3': 5,
    'studentID': '614927',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 2,
    '3': 3,
    'studentID': '713598',
    'finalGrade': 3
  },
  {
    '1': 5,
    '2': 5,
    '3': 2,
    'studentID': '925725',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 2,
    '3': 5,
    'studentID': '957762',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 5,
    '3': 4,
    'studentID': '568237',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 4,
    '3': 4,
    'studentID': '344594',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 1,
    '3': 1,
    'studentID':'517418',
    'finalGrade': 4
  },
  {
    '1': 1,
    '2': 1,
    '3': 3,
    'studentID': '553796',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 1,
    '3': 2,
    'studentID': '861812',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 5,
    '3': 4,
    'studentID': '884396',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 5,
    '3': 4,
    'studentID': '776995',
    'finalGrade': 5
  },
  {
    '1': 2,
    '2': 1,
    '3': 4,
    'studentID': '765712',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 1,
    '3': 1,
    'studentID': '319877',
    'finalGrade': 5
  },
  {
    '1': 1,
    '2': 4,
    '3': 2,
    'studentID': '244216',
    'finalGrade': 1
  },
  {
    '1': 1,
    '2': 3,
    '3': 3,
    'studentID': '137118',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 2,
    '3': 5,
    'studentID': '185676',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 5,
    '3': 5,
    'studentID': '243949',
    'finalGrade': 3
  },
  {
    '1': 4,
    '2': 4,
    '3': 3,
    'studentID': '435694',
    'finalGrade': 1
  },
  {
    '1': 3,
    '2': 1,
    '3': 3,
    'studentID': '451722',
    'finalGrade': 4
  },
  {
    '1': 5,
    '2': 1,
    '3': 5,
    'studentID': '111235',
    'finalGrade': 5
  },
  {
    '1': 4,
    '2': 2,
    '3': 1,
    'studentID': '186234',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 2,
    '3': 4,
    'studentID': '122634',
    'finalGrade': 5
  },
  {
    '1': 2,
    '2': 3,
    '3': 4,
    'studentID': '561726',
    'finalGrade': 2
  },
  {
    '1': 3,
    '2': 4,
    '3': 2,
    'studentID': '439542',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 4,
    '3': 1,
    'studentID': '843632',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 3,
    '3': 5,
    'studentID': '518493',
    'finalGrade': 1
  },
  {
    '1': 3,
    '2': 3,
    '3': 3,
    'studentID': '472634',
    'finalGrade': 3
  },
  {
    '1': 1,
    '2': 2,
    '3': 4,
    'studentID': '649315',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 5,
    '3': 3,
    'studentID': '268531',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 1,
    '3': 5,
    'studentID': '218754',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 3,
    '3': 5,
    'studentID': '763587',
    'finalGrade': 4
  },
  {
    '1': 1,
    '2': 2,
    '3': 4,
    'studentID': '199429',
    'finalGrade': 2
  },
  {
    '1': 5,
    '2': 5,
    '3': 2,
    'studentID': '388837',
    'finalGrade': 4
  },
  {
    '1': 3,
    '2': 5,
    '3': 2,
    'studentID': '347382',
    'finalGrade': 2
  },
  {
    '1': 4,
    '2': 2,
    '3': 5,
    'studentID': '286325',
    'finalGrade': 4
  },
  {
    '1': 1,
    '2': 2,
    '3': 3,
    'studentID': '997214',
    'finalGrade': 2
  },
  {
    '1': 2,
    '2': 5,
    '3': 5,
    'studentID': '581153',
    'finalGrade': 4
  },
  {
    '1': 4,
    '2': 3,
    '3': 4,
    'studentID': '562142',
    'finalGrade': 4
  },
  {
    '1': 2,
    '2': 1,
    '3': 2,
    'studentID': '188547',
    'finalGrade': 3
  },
  {
    '1': 2,
    '2': 1,
    '3': 1,
    'studentID': '745765',
    'finalGrade': 4
  },
  {
    '1': 5,
    '2': 5,
    '3': 3,
    'studentID': '645825',
    'finalGrade': 4
  },
  {
    '1': 5,
    '2': 3,
    '3': 5,
    'studentID': '158329',
    'finalGrade': 3
  }
];

export default mockStudentGradesFinal;