
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

const App: React.FC = () => {
  const auth = useAuth();
  const { settings } = useAppSettings();
  // FIX: Destructured 'quotes' and 'updateQuoteStatus' to pass them as props to the ArchiveView component.
  const { currentQuote, handleCreateQuote, setCurrentQuoteId, quotes, updateQuoteStatus } = useQuote();
  const [viewMode, setViewMode] = useState<'workspace' | 'archive' | 'settings'>('workspace');

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
                onClose={() => setViewMode('workspace')}
                onViewQuote={(id) => {
                    setCurrentQuoteId(id);
                    setViewMode('workspace');
                }}
                role={auth.currentUser.role}
                onUpdateQuoteStatus={updateQuoteStatus}
             />
  }

  if (!currentQuote) {
    return <QuoteTypeSelector 
        onSelect={(type) => {
            handleCreateQuote(type);
            setViewMode('workspace');
        }} 
        onGoToArchive={() => setViewMode('archive')}
        onGoToSettings={() => setViewMode('settings')}
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
