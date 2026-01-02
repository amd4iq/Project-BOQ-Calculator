
import React, { useState } from 'react';
import { useAuth } from './components/Auth/AuthContext.tsx';
import { LoginScreen } from './components/Auth/LoginScreen.tsx';
import { AdminSettingsPage } from './components/Settings/AdminSettingsPage.tsx';
import { UserProfilePage } from './components/Settings/UserProfilePage.tsx';
import { QuoteTypeSelector } from './modules/quotes/components/QuoteTypeSelector.tsx';
import { ArchiveView } from './modules/archive/components/ArchiveView.tsx';
import { Workspace } from './modules/quotes/components/Workspace.tsx';
import { useQuote } from './contexts/QuoteContext.tsx';
import { useAppSettings } from './contexts/AppSettingsContext.tsx';
import { ContractsList } from './modules/contracts/views/ContractsList.tsx';
import { ContractDashboard } from './modules/contracts/views/ContractDashboard.tsx';

const App: React.FC = () => {
  const auth = useAuth();
  const { settings } = useAppSettings();
  const { currentQuote, handleCreateQuote, setCurrentQuoteId, quotes, updateQuoteStatus } = useQuote();
  
  const [viewMode, setViewMode] = useState<'workspace' | 'archive' | 'settings' | 'contracts'>('workspace');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const handleGoToWelcome = () => {
      setCurrentQuoteId(null);
      setViewMode('workspace');
  };

  if (!auth.currentUser || !settings) {
    return <LoginScreen />;
  }
  
  if (viewMode === 'settings') {
    if (auth.currentUser.role === 'admin') {
      return <AdminSettingsPage 
                onClose={() => setViewMode('workspace')} 
                onGoToArchive={() => setViewMode('archive')}
                onGoToContracts={() => setViewMode('contracts')}
             />;
    }
    return <UserProfilePage onClose={() => setViewMode('workspace')} />;
  }

  if (viewMode === 'archive') {
      return <ArchiveView 
                allQuotes={quotes}
                onClose={handleGoToWelcome}
                onViewQuote={(id) => {
                    setCurrentQuoteId(id);
                    setViewMode('workspace');
                }}
                role={auth.currentUser.role}
                onUpdateQuoteStatus={updateQuoteStatus}
                onGoToContracts={() => setViewMode('contracts')}
                onGoToSettings={() => setViewMode('settings')}
                onViewContract={(contractId) => {
                    setSelectedContractId(contractId);
                    setViewMode('contracts');
                }}
             />
  }

  if (viewMode === 'contracts') {
      if (auth.currentUser.role === 'engineer') {
          // Safeguard: Engineers cannot access contracts view. Redirect them.
          setViewMode('workspace');
          return null; 
      }
      if (selectedContractId) {
          return <ContractDashboard 
                    contractId={selectedContractId} 
                    onBack={() => setSelectedContractId(null)}
                    onClose={handleGoToWelcome}
                    onGoToArchive={() => setViewMode('archive')}
                    onGoToSettings={() => setViewMode('settings')}
                 />
      }
      return <ContractsList 
                onSelectContract={setSelectedContractId} 
                onClose={handleGoToWelcome}
                onGoToArchive={() => setViewMode('archive')}
                onGoToSettings={() => setViewMode('settings')}
                onViewQuote={(quoteId) => {
                    setCurrentQuoteId(quoteId);
                    setViewMode('workspace');
                }}
             />;
  }

  // Role-based routing for the "welcome" screen
  if (!currentQuote) {
    // Accountants go directly to contracts
    if (auth.currentUser.role === 'accountant') {
        setViewMode('contracts');
        return null;
    }
    // Admins and Engineers see the quote type selector
    return <QuoteTypeSelector 
        onSelect={(type) => {
            handleCreateQuote(type);
            setViewMode('workspace');
        }} 
        onGoToArchive={() => setViewMode('archive')}
        onGoToSettings={() => setViewMode('settings')}
        onGoToContracts={() => setViewMode('contracts')}
    />;
  }

  // If there's a current quote, show the workspace
  // (An accountant should not be able to reach this state)
  return (
    <Workspace 
        setViewMode={setViewMode} 
        handleGoToWelcome={handleGoToWelcome} 
    />
  );
};

export default App;
