import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress specific warning about defaultProps in memo components
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('defaultProps will be removed from memo components')) {
    return;
  }
  originalError.call(console, ...args);
};

// Error boundary for catching runtime errors
const renderApp = () => {
  try {
    // This ensures we have a proper mounting point
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      
    } else {
      ReactDOM.createRoot(rootElement).render(
        <App />
      );
      
    }
  } catch (error) {
    
    // Display a fallback UI for critical errors
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h1>Application Error</h1>
          <p>Sorry, something went wrong. Please try refreshing the page or contact support if the issue persists.</p>
          <p style="color: red; margin-top: 20px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

renderApp();
