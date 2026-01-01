
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './components/Auth/AuthContext.tsx';
import { AppSettingsProvider } from './contexts/AppSettingsContext.tsx';
import { QuoteProvider } from './contexts/QuoteContext.tsx';
import { ContractProvider } from './contexts/ContractContext.tsx';

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
