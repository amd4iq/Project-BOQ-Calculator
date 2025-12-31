
import React, { useState } from 'react';
import { useAuth } from './components/Auth/AuthContext';
import { LoginScreen } from './components/Auth/LoginScreen';
import { AdminSettingsPage } from './components/Settings/AdminSettingsPage';
import { UserProfilePage } from './components/Settings/UserProfilePage';
import { QuoteTypeSelector } from './components/QuoteTypeSelector';
import { ArchiveView } from './components/ArchiveSys/ArchiveView';
import { Workspace } from './components/Workspace';
import { useQuote } from './contexts/QuoteContext';
import { useAppSettings } from './contexts/AppSettingsContext';
import { ContractsList } from './components/ContractManagement/ContractsList';
import { ContractDashboard } from './components/ContractManagement/ContractDashboard';

const App: React.FC = () => {
  const auth = useAuth();
  const { settings } = useAppSettings();
  const { currentQuote, handleCreateQuote, setCurrentQuoteId, quotes, updateQuoteStatus } = useQuote();
  
  // Navigation State
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
      return <AdminSettingsPage onClose={() => setViewMode('workspace')} />;
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
             />
  }

  if (viewMode === 'contracts') {
      if (selectedContractId) {
          return <ContractDashboard contractId={selectedContractId} onBack={() => setSelectedContractId(null)} />
      }
      return <ContractsList 
                onSelectContract={setSelectedContractId} 
                onClose={() => setViewMode('workspace')}
                onGoToArchive={() => setViewMode('archive')}
                onGoToSettings={() => setViewMode('settings')}
             />;
  }

  if (!currentQuote) {
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

  return (
    <Workspace 
        setViewMode={setViewMode} 
        handleGoToWelcome={handleGoToWelcome} 
    />
  );
};

export default App;
