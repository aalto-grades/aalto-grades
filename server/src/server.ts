// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {app} from './app';
import {BACKEND_PORT} from './configs/environment';
import httpLogger from './configs/winston';
import {connectToDatabase} from './database/index';

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.listen(BACKEND_PORT, async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    httpLogger.error(error);
  }
  httpLogger.info(`Server running on port ${BACKEND_PORT}`);
});
