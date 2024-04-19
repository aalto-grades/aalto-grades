// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import {createGlobalStyle} from 'styled-components';

import App from './App';
import {AuthProvider} from './context/AuthProvider';

const rootElement = document.getElementById('root');

if (rootElement) {
  const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
