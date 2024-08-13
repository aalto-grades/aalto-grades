// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable n/no-process-exit */

import fs from 'fs';
import path from 'node:path';
import readlineSync from 'readline-sync';

type TranslationJson = {[key: string]: TranslationJson | string | undefined};

enum File {
  English = 'public/locales/en/translation.json',
  Finnish = 'public/locales/fi/translation.json',
  Swedish = 'public/locales/sv/translation.json',
}

type Entry = {key: string; value: string};
type FileEntries = {file: string; entries: Entry[]};
type Duplicate = {value: string; keys: string[]};
type Change = {before: string; after: string};

function parseFileEntries(file: File | string): FileEntries {
  const t: {[key: string]: string} = {};
  function parseObject(object: TranslationJson, prefix: string = ''): void {
    for (const key of Object.keys(object)) {
      const value = object[key];
      if (typeof value === 'object') {
        parseObject(value, `${prefix}${key}.`);
      } else {
        t[`${prefix}${key}`] = value as string;
      }
    }
  }

  parseObject(JSON.parse(fs.readFileSync(file).toString()) as TranslationJson);
  return {
    file: file,
    entries: Object.entries(t).map(([key, value]) => ({key, value})),
  };
}

function findDuplicateValues(entries: Entry[]): Duplicate[] {
  const duplicates: {[key: string]: string[]} = {};
  for (const entry of entries) {
    const filtered = entries.filter(other => other.value === entry.value);

    if (filtered.length > 1) {
      duplicates[entry.value] = filtered.map(other => other.key);
    }
  }

  return Object.entries(duplicates).map(([value, keys]) => ({value, keys}));
}

// Validates that there are no duplicate values in entries
function validateNoDuplicates(fileEntries: FileEntries): void {
  const duplicates = findDuplicateValues(fileEntries.entries);
  if (duplicates.length > 0) {
    console.error(
      `Found keys with duplicate values in ${fileEntries.file}, unable to proceed:`
    );
    for (const duplicate of duplicates) {
      console.log(
        `  - ${JSON.stringify(duplicate.keys)} have value "${duplicate.value}"`
      );
    }
    process.exit();
  }
}

// Validates that a and b have the same set of values
function validateValueMatch(a: FileEntries, b: FileEntries): void {
  function validate(x: FileEntries, y: FileEntries): void {
    const notFound: string[] = [];
    for (const xEntry of x.entries) {
      const filtered = y.entries.filter(
        yEntry => yEntry.value === xEntry.value
      );

      if (filtered.length === 0) {
        notFound.push(xEntry.value);
      }
    }

    if (notFound.length > 0) {
      console.error(
        `Found values in ${x.file} not present in ${y.file}, unable to proceed:`
      );
      for (const value of notFound) {
        console.log(`  - ${value}`);
      }
      process.exit();
    }
  }

  validate(a, b);
  validate(b, a);
}

function findChanges(before: FileEntries, after: FileEntries): Change[] {
  validateNoDuplicates(before);
  validateNoDuplicates(after);
  validateValueMatch(before, after);

  const changes: Change[] = [];
  for (const beforeEntry of before.entries) {
    const afterEntry = after.entries.find(
      a => a.value === beforeEntry.value
    ) as Entry;

    if (afterEntry.key !== beforeEntry.key) {
      changes.push({
        before: beforeEntry.key,
        after: afterEntry.key,
      });
    }
  }

  return changes;
}

function updateSourceCode(changes: Change[]): void {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function findSourceFiles(): string[] {
    const files: string[] = [];
    function find(directory: string = 'src'): void {
      for (const read of fs.readdirSync(directory)) {
        const sub = `${directory}/${read}`;
        if (fs.lstatSync(sub).isDirectory()) {
          find(sub);
        } else {
          files.push(sub);
        }
      }
    }

    find();
    return files;
  }

  const files = findSourceFiles();
  for (const change of changes) {
    for (const file of files) {
      const data = fs.readFileSync(file, 'utf8');

      const oldRegExp = new RegExp(`t\\(\\s*'${escapeRegExp(change.before)}`);
      const result = data.replace(oldRegExp, `t('${change.after}`);
      fs.writeFileSync(file, result, 'utf8');
    }
  }
}

function updateTranslation(file: File, changes: Change[]): void {
  const backupDir = `${path.dirname(file)}/backups`;
  const backup = `${backupDir}/translation.json.${new Date().toISOString()}`;
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  fs.copyFileSync(file, backup);

  const original = JSON.parse(
    fs.readFileSync(file).toString()
  ) as TranslationJson;
  const updated: TranslationJson = structuredClone(original);

  function get(object: TranslationJson, key: string): string {
    const keyParts = key.split('.');
    let value: string | null = null;

    let iter: TranslationJson = object;
    keyParts.forEach((part, i) => {
      if (i === keyParts.length - 1) {
        value = iter[part] as string;
      } else {
        iter = iter[part] as TranslationJson;
      }
    });

    return value!;
  }

  function set(
    object: TranslationJson,
    key: string,
    value: string | undefined
  ): void {
    const keyParts = key.split('.');

    let iter: TranslationJson = object;
    keyParts.forEach((part, i) => {
      if (i === keyParts.length - 1) {
        iter[part] = value;
      } else {
        if (iter[part] === undefined) {
          iter[part] = {};
        }
        iter = iter[part] as TranslationJson;
      }
    });
  }

  for (const change of changes) {
    const value = get(original, change.before);
    set(updated, change.before, undefined);
    set(updated, change.after, value);
  }

  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
}

function rename(): void {
  const original = parseFileEntries(File.English);
  const updated = parseFileEntries('translation.json');
  const changes = findChanges(original, updated);

  updateSourceCode(changes);
  updateTranslation(File.English, changes);
  updateTranslation(File.Finnish, changes);
  updateTranslation(File.Swedish, changes);
}

function merge(): void {
  const fileEntries = parseFileEntries(File.English);
  const duplicates = findDuplicateValues(fileEntries.entries);

  if (duplicates.length === 0) {
    console.log('No duplicate values found, nothing to do.');
    return;
  }

  console.log(
    'The following keys have the same values. Please enter the index of the key to ' +
      'use for the values or enter a new key.'
  );

  const changes: Change[] = [];
  for (const duplicate of duplicates) {
    const max = duplicate.keys.length - 1;

    let question = `\n'${duplicate.value}'\n`;
    duplicate.keys.forEach((key, i) => (question += `${i}: ${key}\n`));
    question += `[0-${max} or new key]: `;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      let chosenKey = readlineSync.question(question);
      const selection = Number(chosenKey);

      if (!isNaN(selection)) {
        if (!Number.isInteger(selection)) {
          console.log('\nERROR: Selection must be an integer.');
          continue;
        }
        if (selection < 0 || selection > max) {
          console.log(`\nERROR: Selection must be between 0 and ${max}.`);
          continue;
        }
        chosenKey = duplicate.keys[selection];
      }

      for (const key of duplicate.keys) {
        if (key !== chosenKey) {
          changes.push({
            before: key,
            after: chosenKey,
          });
        }
      }
      break;
    }
  }

  updateSourceCode(changes);
  updateTranslation(File.English, changes);
  updateTranslation(File.Finnish, changes);
  updateTranslation(File.Swedish, changes);
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log('Please pass exactly one argument');
  process.exit();
}

const command = args[0];
switch (command) {
  case 'rename':
    rename();
    break;

  case 'merge':
    merge();
    break;

  default:
    console.error(`Unrecognized command '${command}'`);
}
