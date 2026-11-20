import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { startMocking } from './mocks/browser.js';

startMocking()
  // Show React after the mock API is ready.
  .then(() => {
    createRoot(document.getElementById('root')).render(
      <React.StrictMode><App /></React.StrictMode>
    );
  })
  // Show a clear message if startup fails.
  .catch((error) => {
    console.error('Mock API failed to start:', error);
    document.getElementById('root').textContent =
      'تعذّر تشغيل المحاكاة. افتح Console للتفاصيل. استخدم npm run dev ثم localhost.';
  });
