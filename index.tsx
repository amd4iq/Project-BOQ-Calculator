
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/Auth/AuthContext';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import { QuoteProvider } from './contexts/QuoteContext';
import { ContractProvider } from './contexts/ContractContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppSettingsProvider>
        <ContractProvider>
            <QuoteProvider>
            <App />
            </QuoteProvider>
        </ContractProvider>
      </AppSettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);
