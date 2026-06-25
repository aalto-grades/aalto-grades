// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT
import {PROTOCOL_HANDLER_NAME, PROTOCOL_HANDLER_URL} from '../configs/environment';
import type {Endpoint} from '../types';

export const getClientEnvVariables: Endpoint<void, Record<string, unknown>> = async (req, res) => {
  res.json({
    AALTO_GRADES_VERSION: process.env.AALTO_GRADES_VERSION || 'unknown',
    PROTOCOL_HANDLER_NAME: PROTOCOL_HANDLER_NAME,
    PROTOCOL_HANDLER_URL: PROTOCOL_HANDLER_URL,
    EXTERNAL_SERVICES: [
      {
        id: 'mycourses',
        label: 'MyCourses',
        tokenLink: `https://mycourses.aalto.fi/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=${(Math.random() * 10000).toFixed(0)}&urlscheme=${encodeURIComponent(PROTOCOL_HANDLER_NAME)}`,
      },
      {
        id: 'aplus',
        label: 'A+',
        tokenLink: 'https://plus.cs.aalto.fi/accounts/accounts/',
      },
    ],
  });
};
