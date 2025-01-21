// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import './i18n';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {createGlobalStyle} from 'styled-components';

import App from './App';
import {AuthProvider} from './context/AuthProvider';

const rootElement = document.querySelector('#root');

if (rootElement) {
  const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

  body {
    margin: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }`;

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <GlobalStyles />
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}
