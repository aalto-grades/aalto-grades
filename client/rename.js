// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import fs from 'fs';

function parseJsonEntries(file) {
  const t = {};

  function inner(object, prefix = '') {
    for (const key of Object.keys(object)) {
      const value = object[key];
      if (typeof value === 'object') {
        inner(value, `${prefix}${key}.`);
      } else {
        t[`${prefix}${key}`] = value;
      }
    }
  }

  inner(JSON.parse(fs.readFileSync(file)));
  return Object.entries(t);
}

function checkDuplicateValues(entries, name) {
  const duplicates = {};
  for (const [_, value] of entries) {
    const filtered = entries.filter(([_, other]) => other === value);

    if (filtered.length > 1) {
      duplicates[value] = filtered.map(([key, _]) => key);
    }
  }

  const duplicateEntries = Object.entries(duplicates);
  if (duplicateEntries.length > 0) {
    console.error(`Found keys with duplicate values in ${name} entries, unable to proceed:`);
    for (const [value, keys] of duplicateEntries) {
      console.error(`  - ${JSON.stringify(keys)} have value "${value}"`);
    }
    process.exit();
  }
}

function checkValueMatch(oldEntries, newEntries) {
  function inner(aEntries, bEntries, aName, bName) {
    const notFound = [];
    for (const [_, aValue] of aEntries) {
      const filtered = bEntries.filter(([_, bValue]) => bValue === aValue);

      if (filtered.length === 0) {
        notFound.push(aValue);
      }
    }

    if (notFound.length > 0) {
      console.error(`Found values in ${aName} entries not present in ${bName} entries, unable to proceed:`);
      for (const value of notFound) {
        console.error(`  - ${value}`);
      }
      process.exit();
    }
  }

  inner(oldEntries, newEntries, 'old', 'new');
  inner(newEntries, oldEntries, 'new', 'old');
}

function findFiles() {
  const files = [];

  function inner(directory = 'src') {
    for (const read of fs.readdirSync(directory)) {
      const sub = `${directory}/${read}`
      if (fs.lstatSync(sub).isDirectory()) {
        inner(sub);
      } else {
        files.push(sub);
      }
    }
  }

  inner();
  return files;
}

function updateSourceCode(oldEntries, newEntries) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const keyChanges = [];
  const files = findFiles();
  for (const [oldKey, oldValue] of oldEntries) {
    const [newKey, _] = newEntries.find(([_, newValue]) => newValue === oldValue);
    keyChanges.push([oldKey, newKey]);

    if (newKey !== oldKey) {
      for (const file of files) {
        const data = fs.readFileSync(file, 'utf8');

        const oldRegExp = new RegExp(`t\\(\\s*'${escapeRegExp(oldKey)}`)
        const result = data.replace(oldRegExp, `t('${newKey}`);
        fs.writeFileSync(file, result, 'utf8');
      }
    }
  }

  return keyChanges;
}

function updateTranslationJson(locale, keyChanges) {
  const file = `public/locales/${locale}/translation.json`;

  const backupDir = `public/locales/${locale}/backups`;
  const backup = `${backupDir}/translation.json.${new Date().toISOString()}`;
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  fs.copyFileSync(file, backup);

  const object = JSON.parse(fs.readFileSync(file));
  const updated = {};

  for (const [oldKey, newKey] of keyChanges) {
    const oldKeyParts = oldKey.split('.');
    const newKeyParts = newKey.split('.');

    let source = object;
    oldKeyParts.forEach((keyPart) => source = source[keyPart]);

    let destination = updated;
    newKeyParts.forEach((keyPart, i) => {
      let value = destination[keyPart];

      if (i === newKeyParts.length - 1) {
        destination[keyPart] = source;
      } else {
        if (value === undefined) {
          value = {};
          destination[keyPart] = value;
        }
        destination = value;
      }
    });
  }

  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
}

const oldEntries = parseJsonEntries('public/locales/en/translation.json');
const newEntries = parseJsonEntries('translation.json');

checkDuplicateValues(oldEntries, 'old');
checkDuplicateValues(newEntries, 'new');
checkValueMatch(oldEntries, newEntries);

const keyChanges = updateSourceCode(oldEntries, newEntries);
for (const locale of ['en', 'fi', 'sv']) {
  updateTranslationJson(locale, keyChanges);
}
