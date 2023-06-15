// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export function sleep(ms: number = 2000): Promise<any> {
  return new Promise(r => setTimeout(r, ms));
}
