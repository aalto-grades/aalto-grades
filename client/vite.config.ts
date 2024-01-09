// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/// <reference types="vitest" />
// import * as path from 'path';
import react from '@vitejs/plugin-react';
// import license from 'rollup-plugin-license';
// import {defineConfig} from 'vitest/config';
import {defineConfig} from 'vite';

// import viteTsconfigPaths from 'vite-tsconfig-paths';

// export default defineConfig(({mode}) => {
export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  plugins: [
    react(),
    // viteTsconfigPaths()
    // license({
    //   thirdParty: {
    //     includePrivate: false,
    //     // allow: {
    //     //   test: dependency => {
    //     //     // Return false for unlicensed dependencies.
    //     //     if (!dependency.license) return false;

    //     //     // Special case for `@nuxt/ui-templates` which publishes design resources under `CC-BY-ND-4.0`.
    //     //     if (
    //     //       dependency.name === '@nuxt/ui-templates' &&
    //     //       dependency.license === 'CC-BY-ND-4.0'
    //     //     )
    //     //       return true;

    //     //     // Allow MIT and Apache-2.0 licenses.
    //     //     return ['MIT', 'Apache-2.0'].includes(dependency.license);
    //     //   },
    //     //   failOnUnlicensed: true,
    //     //   failOnViolation: true,
    //     // },
    //     output: {
    //       // Output file into public directory which is included in the build output.
    //       file: 'public/dependencies.json',
    //       template(dependencies) {
    //         return JSON.stringify(dependencies);
    //       },
    //     },
    //   },
    // }),
  ],
  //   resolve: {
  //     alias: [{find: '@', replacement: path.resolve(__dirname, './src')}],
  //   },
  esbuild: {
    loader: 'tsx', // Or 'jsx' if you're not using TypeScript
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
    // this sets a default port to 3000
    port: 3005,
  },
});
