// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import {createGlobalStyle} from 'styled-components';

import App from './App';
import {AuthProvider} from './context/AuthProvider';
import './i18n';

const rootElement = document.getElementById('root');

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
    // transition: all 0.5s ease-in;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <GlobalStyles />
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}
