// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

var fs = require('fs');
var path = require('path');

// Check for the --dry flag
var isDryRun = process.argv.includes('--dry');

// Get the path to be cleaned from the command line arguments
var folderPath;
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '-p' && i + 1 < process.argv.length) {
    folderPath = process.argv[i + 1];
    break;
  }
}


function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
        fs.readdirSync(folderPath).forEach(function (file, index) {
            var curPath = path.join(folderPath, file);

            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                if (isDryRun) {
                    console.log(`Would delete file: ${curPath}`);
                } else {
                    fs.unlinkSync(curPath);
                }
            }
        });

        if (isDryRun) {
            console.log(`Would delete directory: ${folderPath}`);
        } else {
            // console.log(`Deleting directory "${folderPath}"...`);
            fs.rmdirSync(folderPath);
        }
    }
}
if (isDryRun) {
    console.log('Dry run enabled. ');
} else {
    console.log(`Deleting folder "${folderPath}"`);
}

deleteFolderRecursive(folderPath);

if (isDryRun) {
    console.log('Dry run complete. No files were actually deleted.');
} else {
    console.log('Successfully cleaned working tree!');
}