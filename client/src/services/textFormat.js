// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers

// SPDX-License-Identifier: MIT

// use 'en-GB' to get "20.07.2012, 05:00:00" 
// (instead of 'fi-GB' which produces "20.7.2012 klo 5.00.00")
const formatDate = (date) => {
  const string = date.toLocaleString('en-GB').replaceAll('/', '.');
  return string.split(',')[0];
};

export default { formatDate };