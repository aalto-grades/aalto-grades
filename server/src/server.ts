// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from './app';
import { connectToDatabase } from './database/index';
import { PORT } from './configs/environment';

app.listen(PORT, async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.log(error);
  }
  console.log(`Server running on port ${PORT}`);
});
