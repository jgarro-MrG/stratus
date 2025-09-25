import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { DataStoreProvider, useDataStore } from './contexts/DataStoreContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppDataProvider } from './contexts/AppDataContext';

import Sidebar from './components/Sidebar';
import GlobalHeader from './components/GlobalHeader';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ReportsPage from './pages/ReportsPage';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AppDataProvider>
      <div className="flex h-screen bg-background text-text-primary font-sans">
        <div className="w-64 flex-shrink-0 hidden md:block">
          {/* // FIX: Correctly handle navigation for closing file */}
          <Sidebar onNavigate={() => navigate('/')} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <GlobalHeader />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50 dark:bg-gray-900/50">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </AppDataProvider>
  );
};

const AppContent: React.FC = () => {
  const { isReady, isLoading } = useDataStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-text-primary">
        <p>Loading application...</p>
      </div>
    );
  }

  return isReady ? <AppLayout /> : <LandingPage />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DataStoreProvider>
          <Router>
            <AppContent />
          </Router>
        </DataStoreProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
