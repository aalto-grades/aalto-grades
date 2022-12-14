// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

const formatDate = (date) => {
  const string = date.toLocaleString('en-GB').replaceAll('/', '.');
  return string.split(',')[0];
};

export default {formatDate};