// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://back-end';
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || '3000';

export default axios.create({
  baseURL: `${BACKEND_URL}:${BACKEND_PORT}`,
  withCredentials: true
});
