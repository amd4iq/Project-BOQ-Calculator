
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/Auth/AuthContext';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import { QuoteProvider } from './contexts/QuoteContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppSettingsProvider>
        <QuoteProvider>
          <App />
        </QuoteProvider>
      </AppSettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
