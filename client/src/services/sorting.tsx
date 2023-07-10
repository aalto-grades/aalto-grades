// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// used sort dates in descending order
function compareDate(a: Date, b: Date): number {
  if (a < b)
    return 1;
  else if (a > b)
    return -1;

  return 0;
}

// Three following functions are used by CourseResultsTable for sortin the table

// orders a and b in descending order
// a and b = objects
// orderBy = key of the values that determine the order
function descendingComparator(a: any, b: any, orderBy: string): number {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Calculates the comparator for StableSort
// order = 'desc' or 'asc'
// order by = id of the table head that determines the order
function getComparator(order: any, orderBy: any) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

// Sorts the array by comparator (descending or ascending)
// comparator can be calculated with the getComparator function
// array = array of objects
function stableSort(array: any, comparator: any) {
  const stabilizedThis = array.map((el: any, index: any) => [el, index]);
  stabilizedThis.sort((a: any, b: any) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el: any) => el[0]);
}

export default { compareDate, descendingComparator, getComparator, stableSort };
