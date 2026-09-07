// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {ZodIssueLike} from '@/types';

/**
 * Extract validation issues from a server error response body.
 *
 * The server sends `[{type, errors: {issues: [...]}}]`. Older servers sent the
 * raw ZodError object, which JSON.stringify turns into
 * `{name: 'ZodError', message: '<stringified issues array>'}`, so the issues
 * have to be recovered from the message field for those responses.
 */
const isIssueArray = (value: unknown): value is ZodIssueLike[] =>
  Array.isArray(value)
  && value.every(
    issue => typeof issue === 'object'
      && issue !== null
      && typeof (issue as {message?: unknown}).message === 'string'
  );

export const extractZodIssues = (data: unknown): ZodIssueLike[] | null => {
  if (!Array.isArray(data)) return null;

  const issues: ZodIssueLike[] = [];

  for (const entry of data) {
    if (typeof entry !== 'object' || entry === null) continue;
    const errors = (entry as {errors?: unknown}).errors;

    if (typeof errors === 'object' && errors !== null) {
      const {issues: entryIssues} = errors as {issues?: unknown; name?: unknown; message?: unknown};

      if (isIssueArray(entryIssues)) {
        issues.push(...entryIssues);
        continue;
      }

      // Legacy serialized ZodError: {name: 'ZodError', message: '<issues as JSON>'}
      if (
        (errors as {name?: unknown}).name === 'ZodError'
        && typeof (errors as {message?: unknown}).message === 'string'
      ) {
        const message = (errors as {message: string}).message;
        try {
          const parsed: unknown = JSON.parse(message);
          if (isIssueArray(parsed)) {
            issues.push(...parsed);
            continue;
          }
        } catch {
          /* Fall through to the plain message below */
        }
        issues.push({message});
        continue;
      }
    }

    if (typeof errors === 'string') {
      issues.push({message: errors});
    }
  }

  return issues.length > 0 ? issues : null;
};

export const formatZodIssues = (issues: ZodIssueLike[]): string =>
  issues
    .map(issue => `'/${(issue.path ?? []).join('/')} : ${issue.message}'`)
    .join(', ');
