// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:3000',
});
