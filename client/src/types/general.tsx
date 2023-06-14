// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface ApiResponse<T> {
  success: boolean,
  data?: T,
  errors?: Array<string>
}

export interface Message {
  msg: string,
  severity?: 'error' | 'warning' | 'info' | 'success'
}
