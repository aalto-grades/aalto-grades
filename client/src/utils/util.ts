// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export function sleep(ms: number): Promise<any> {
  return new Promise(r => setTimeout(r, ms));
}
