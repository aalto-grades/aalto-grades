// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import license from 'rollup-plugin-license';
import {defineConfig} from 'vite';

import libreJs from './libre-js-plugin';
console.log('Current Node Version:', process.version);
const rootPackageVersion = (
  JSON.parse(fs.readFileSync('../package.json').toString()) as {
    version: string;
  }
).version;

const runGitCommand = (command: string): string | null => {
  try {
    return execSync(command, {encoding: 'utf8'}).trim();
  } catch {
    return null;
  }
};

const gitShortSha =
  (process.env.GIT_SHA?.slice(0, 7)
    ?? runGitCommand('git rev-parse --short=7 HEAD')
    ?? 'unknown');

const buildTime = Temporal.Now.zonedDateTimeISO('Europe/Helsinki').toString({
  smallestUnit: 'minute',
  fractionalSecondDigits: 0,
  calendarName: 'never',
  timeZoneName: 'auto',
});

const gitTagName = process.env.GIT_REF_TYPE === 'tag' ? (process.env.GIT_REF_NAME ?? null) : null;

const resolvedVersion = gitTagName ?? `⇛ ${gitShortSha} - ${buildTime}`;

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mkcert(),
    react(),
    license({
      thirdParty: {
        includePrivate: false,
        output: {
          file: 'build/dependencies.json',
          template(dependencies) {
            return JSON.stringify(dependencies);
          },
        },
      },
    }),
    libreJs({
      indexFile: 'index.html',
      webLabelsFile: 'javascript.html',
      dependenciesFile: 'dependencies.json',
      projectLicense: 'Expat',
      licenseExceptions: ['0BSD'],
    }),
  ],
  define: {
    // The build will contain a syntax error if we don't manually insert quotes
    AALTO_GRADES_VERSION: JSON.stringify(resolvedVersion || rootPackageVersion),
  },
  optimizeDeps: {
    include: ['common'],
  },
  build: {
    outDir: './build',
    commonjsOptions: {
      include: [/common/, /node_modules/],
    },
  },
  server: {
    open: true,
    port: 3005,
    https: { },
    // Forward `/api/v1/*` to `localhost:3000/v1/*`
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  }

});
