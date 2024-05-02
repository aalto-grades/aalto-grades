// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {app} from './app';
import {PORT} from './configs/environment';
import logger from './configs/winston';
import {connectToDatabase} from './database/index';

app.listen(PORT, async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    logger.error(error);
  }
  logger.info(`Server running on port ${PORT}`);
});
