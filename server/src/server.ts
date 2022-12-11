// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from './app';
import { connectToDatabase } from './database/index';

const parsedPort: number = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;

app.listen(port, async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.log(error);
  }
  console.log(`Server running on port ${port}`);
});
