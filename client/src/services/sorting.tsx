// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// used to sort by course code, takes two codes (or strings) as parameters
function sortByCode(a: string, b: string): number {
  const codeA: string = a.toUpperCase();
  const codeB: string = b.toUpperCase();
  if (codeA < codeB) {
    return -1;
  }
  if (codeA > codeB) {
    return 1;
  }
  return 0;
}

// used sort dates in descending order
function sortByDate(a, b): number {
  const order = a - b;
  return order < 0 ? 1 : (order > 0 ? -1 : 0);
}

// Three following functions are used by CourseResultsTable for sortin the table

// orders a and b in descending order
// a and b = objects
// orderBy = key of the values that determine the order
function descendingComparator(a: object, b: object, orderBy: string): number {
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
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Sorts the array by comparator (descending or ascending)
// comparator can be calculated with the getComparator function
// array = array of objects
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default { sortByCode, sortByDate, descendingComparator, getComparator, stableSort };
