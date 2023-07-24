// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// used sort dates in descending order
export function compareDate(a: Date, b: Date): number {
  if (a < b)
    return 1;

  if (a > b)
    return -1;

  return 0;
}

// Three following functions are used by CourseResultsTable for sortin the table

// orders a and b in descending order
export function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  if (b[orderBy] < a[orderBy])
    return -1;

  if (b[orderBy] > a[orderBy])
    return 1;

  return 0;
}

type Comparator<T> = (a: T, b: T) => number;

// Calculates the comparator for StableSort
// order by = id of the table head that determines the order
export function getComparator<T>(order: 'asc' | 'desc', orderBy: keyof T): Comparator<T> {
  const sign: number = (order === 'desc') ? 1 : -1;

  return (a: T, b: T): number => {
    return sign * descendingComparator(a, b, orderBy);
  };
}

// Sorts the array by comparator (descending or ascending)
// comparator can be calculated with the getComparator function
export function stableSort<T>(array: Array<T>, comparator: Comparator<T>): Array<T> {
  const stabilizedThis: Array<[T, number]> = array.map(
    (el: T, index: number): [T, number] => [el, index]
  );

  stabilizedThis.sort((a: [T, number], b: [T, number]) => {
    const order: number = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });

  return stabilizedThis.map((el: [T, number]): T => el[0]);
}
