// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/// <reference types="vitest" />
// import * as path from 'path';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import license from 'rollup-plugin-license';
import {defineConfig} from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

import libreJs from './libre-js-plugin';

// export default defineConfig(({mode}) => {
export default defineConfig({
  // depending on your application, base can also be "/"
  base: '/',
  plugins: [
    react(),
    viteTsconfigPaths(),
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
  //   resolve: {
  //     alias: [{find: '@', replacement: path.resolve(__dirname, './src')}],
  //   },
  define: {
    // The build will contain a syntax error if we don't manually insert quotes
    AALTO_GRADES_VERSION:
      '"' +
      (
        JSON.parse(fs.readFileSync('../package.json').toString()) as {
          version: string;
        }
      ).version +
      '"',
  },
  esbuild: {
    loader: 'tsx',
    pure: ['console.log'],
  },
  optimizeDeps: {
    include: ['common'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    include: ['./**/*.test.ts', './**/*.test.tsx'],
    globals: true,
    testTimeout: 100000,
    css: true,
  },
  build: {
    outDir: './build',
    commonjsOptions: {
      include: [/common/, /node_modules/],
    },
    rollupOptions: {
      plugins: [],
    },
  },
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3005
    port: 3005,
    // Forward /api/v1/... to localhost:3000/v1/...
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
