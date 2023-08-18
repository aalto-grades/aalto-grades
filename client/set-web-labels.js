// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/*
 * The build script of React generates a main.js file with a hash, so the
 * JavaScript license web labels table must be different in each production
 * build. This script automates the process of getting the proper path and
 * modifying the table in the build.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const checker = require('license-checker-rseidelsohn');
const parse = require('spdx-expression-parse');

const jsFilename = `${process.cwd()}/build/javascript.html`;
const jsBuffer = fs.readFileSync(jsFilename);
const manifestBuffer = fs.readFileSync(`${process.cwd()}/build/asset-manifest.json`);

const main = JSON.parse(manifestBuffer).files['main.js'].split('/').at(-1);

const $ = cheerio.load(jsBuffer);
$('#main').attr('href', `/static/js/${main}`);
$('#main').text(main);

async function addLicenses() {
  const libreJsLicenseList = (await axios.get(
    'https://git.savannah.gnu.org/cgit/librejs.git/plain/common/license_definitions.json'
  )).data;

  const spdxLicenseList = (await axios.get(
    'https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json'
  )).data.licenses;

  function traverseSpdxExpr(addLicenseData, expr) {
    if (expr.license) {
      const spdx = spdxLicenseList.find((val) => val.licenseId === expr.license);
      if (spdx) {
        if (spdx.isFsfLibre) {
          addLicenseData(spdx.licenseId, spdx.reference);
        } else {
          console.error(`Encountered NON-FREE license: ${spdx.licenseId}, ${spdx.name}`);
        }
      } else {
        console.error(`Encountered unknown license: ${expr.license}`);
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
              console.error(`Encountered unknown license: ${packageLicense}`);
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
