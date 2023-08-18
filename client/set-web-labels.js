// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/*
 * The build script of React generates a main.js file with a hash, so the
 * JavaScript license web labels table must be different in each production
 * build.
 *
 * This script automates the process of getting the proper path of main.js and
 * modifying the table in the build, including identifying and adding the
 * licenses of all dependencies.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const checker = require('license-checker-rseidelsohn');
const parse = require('spdx-expression-parse');

// Load the web labels HTML file
const jsFilename = `${process.cwd()}/build/javascript.html`;
const $ = cheerio.load(fs.readFileSync(jsFilename));

// Load the manifest file containing the hash of the generated main.js file
const manifestBuffer = fs.readFileSync(`${process.cwd()}/build/asset-manifest.json`);
const main = JSON.parse(manifestBuffer).files['main.js'].split('/').at(-1);

// Set the proper name of main.js
$('#main').attr('href', `/static/js/${main}`);
$('#main').text(main);

async function addLicenses() {
  // Licenses recognized as free by LibreJS
  const libreJsLicenseList = (await axios.get(
    'https://git.savannah.gnu.org/cgit/librejs.git/plain/common/license_definitions.json'
  )).data;

  // Full SPDX license list, contains both free and non-free licenses
  const spdxLicenseList = (await axios.get(
    'https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json'
  )).data.licenses;

  // Licenses manually identified as free, but not recognized by LibreJS nor
  // listed in the SPDX license list as free
  const exceptionsList = JSON.parse(
    fs.readFileSync(`${process.cwd()}/license-exceptions.json`)
  ).licenses;

  function checkExceptions(addLicenseData, license, isUnknown) {
    const helper =
      '\nPlease verify whether this is a free software license as defined by the'
      + ' Free Software Foundation (https://www.gnu.org/licenses/license-list.html).'
      + '\nIf so, please add its identifier and URL to the list of exceptions in'
      + ' license-exceptions.json.\nIf not, the dependency MUST be removed.\n';

    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const red = "\x1b[31m";

    const free = exceptionsList.find((val) => val.id === license);
    if (free) {
      addLicenseData(free.id, free.url);
    } else if (isUnknown) {
      console.error(
        `${bold}Encountered unrecognized license: ${expr.license}`
        + `${reset}${helper}`
      );
    } else {
      console.error(
        `${bold}Encountered ${red}NON-FREE${reset}${bold} license: ${license}`
        + `${reset}${helper}`
      );
    }
  }

  function traverseSpdxExpr(addLicenseData, expr) {
    if (expr.license) {
      const spdx = spdxLicenseList.find((val) => val.licenseId === expr.license);

      if (spdx) {
        if (spdx.isFsfLibre) {
          addLicenseData(spdx.licenseId, spdx.reference);
        } else {
          checkExceptions(addLicenseData, expr.license, false);
        }
      } else {
        checkExceptions(addLicenseData, expr.license, true);
      }
    }

    if (expr.left) {
      traverseSpdxExpr(addLicenseData, expr.left);
    }

    if (expr.right) {
      traverseSpdxExpr(addLicenseData, expr.right);
    }
  }

  checker.init(
    {
      start: '.',
      excludePrivatePackages: true,
      production: true
    },
    (error, packages) => {
      if (error) {
        console.error(error.message);
      } else {
        const licenseData = {
          idSet: new Set(),
          urlMap: new Map()
        };

        function addLicenseData(id, url) {
          // MIT can be ignored because it is already listed manually since it
          // is the license of Aalto Grades itself
          if (id !== 'MIT' && !licenseData.idSet.has(id)) {
            licenseData.idSet.add(id);
            licenseData.urlMap.set(id, url);
          }
        }

        for (const key of Object.keys(packages)) {
          const packageLicense = packages[key].licenses;

          const libreJs = libreJsLicenseList[packageLicense];
          if (libreJs) {
            addLicenseData(libreJs.identifier, libreJs.canonicalUrl[0]);
          } else {
            try {
              traverseSpdxExpr(addLicenseData, parse(packageLicense));
            } catch (parseError) {
              checkExceptions(addLicenseData, packageLicense, true);
            }
          }
        }

        for (const [id, url] of licenseData.urlMap.entries()) {
          $(`<a href="${url}">${id}</a>\n`).appendTo('#licenses');
        }
      }

      fs.writeFileSync(jsFilename, $.html());
    }
  )
}

addLicenses();
