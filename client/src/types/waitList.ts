// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

export const WaitListStatus = {
  Pending: 'PENDING',
  Passed: 'PASSED',
  Failed: 'FAILED',
} as const;

export type WaitListStatus =
  (typeof WaitListStatus)[keyof typeof WaitListStatus];

export type WaitListEntryData = {
  id: number;
  user: {
    id: number;
    name: string | null;
    email: string | null;
    studentNumber: string;
  };
  courseId: number;
  reason: string | null;
  dateAdded: Date;
  dateResolved: Date | null;
  status: WaitListStatus;
};

export type NewWaitListEntry = {
  studentNumber: string;
  reason: string | null;
  dateAdded?: Date | null;
  dateResolved?: Date | null;
  status?: WaitListStatus | null;
};

export type EditWaitListEntry = {
  id: number;
  reason?: string | null;
  dateAdded?: Date | null;
  dateResolved?: Date | null;
  status?: WaitListStatus | null;
};

export type WaitListManualGrade = {
  courseTaskId: number;
  grade: number;
  comment?: string | null;
};

export type WaitListRelease = {
  entryIds: number[];
  status: WaitListStatus;
  dateResolved?: Date | null;
  manualGrade?: WaitListManualGrade | null;
};

export type WaitListImportEntry = {
  entryId?: number | null;
  studentNumber: string;
  reason?: string | null;
  dateAdded?: Date | null;
  dateResolved?: Date | null;
  status?: WaitListStatus | null;
};
