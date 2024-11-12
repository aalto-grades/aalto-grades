import {test as teardown} from '@playwright/test';

import {cleanDb} from './helper';

teardown('delete database', async () => {
  await cleanDb();
});
