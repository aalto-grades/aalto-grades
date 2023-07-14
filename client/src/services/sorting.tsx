// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// used sort dates in descending order
function compareDate(a: Date, b: Date): number {
  if (a < b)
    return 1;

  if (a > b)
    return -1;

  return 0;
}

// Three following functions are used by CourseResultsTable for sortin the table

// orders a and b in descending order
function descendingComparator(
  a: object, b: object, orderBy: keyof object
): number {
  if (b[orderBy] < a[orderBy])
    return -1;

  if (b[orderBy] > a[orderBy])
    return 1;

  return 0;
}

type Comparator = (a: object, b: object) => number;

// Calculates the comparator for StableSort
// order by = id of the table head that determines the order
function getComparator(order: 'asc' | 'desc', orderBy: string): Comparator {
  const sign: number = (order === 'desc') ? 1 : -1;

  return (a: object, b: object): number => {
    return sign * descendingComparator(a, b, orderBy as keyof object);
  };
}

// Sorts the array by comparator (descending or ascending)
// comparator can be calculated with the getComparator function
function stableSort(array: Array<object>, comparator: Comparator): Array<object> {
  const stabilizedThis: Array<[object, number]> = array.map(
    (el: object, index: number): [object, number] => [el, index]
  );

  stabilizedThis.sort((a: [object, number], b: [object, number]) => {
    const order: number = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });

  return stabilizedThis.map((el: [object, number]): object => el[0]);
}

export default { compareDate, descendingComparator, getComparator, stableSort };
