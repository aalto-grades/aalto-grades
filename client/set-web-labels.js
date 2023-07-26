// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/*
 * The build script of React generates a main.js file with a hash, so the
 * JavaScript license web labels table must be different in each production
 * build. This script automates the process of getting the proper path and
 * modifying the table in the build.
 */

const cheerio = require('cheerio');
const fs = require('fs');

const jsFilename = `${process.cwd()}/build/javascript.html`;
const jsBuffer = fs.readFileSync(jsFilename);
const manifestBuffer = fs.readFileSync(`${process.cwd()}/build/asset-manifest.json`);

const main = JSON.parse(manifestBuffer).files['main.js'].split('/').at(-1);

const $ = cheerio.load(jsBuffer);
$('#main').attr('href', `/static/js/${main}`);
$('#main').text(main);

fs.writeFileSync(jsFilename, $.html());
