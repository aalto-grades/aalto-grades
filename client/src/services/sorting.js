// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

//used to sort by course code, takes two codes (or strings) as parameters
const sortByCode = (a, b) => {
  const codeA = a.toUpperCase();
  const codeB = b.toUpperCase();
  if (codeA < codeB) {
    return -1;
  }
  if (codeA > codeB) {
    return 1;
  }
  return 0;
};

export default { sortByCode };
