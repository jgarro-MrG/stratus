import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';

import Sidebar from './components/Sidebar';
import GlobalHeader from './components/GlobalHeader';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import TimeLogPage from './pages/TimeLogPage';
import LandingPage from './pages/LandingPage';
import Spinner from './components/Spinner';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background text-text-primary font-sans">
      <div className="w-64 flex-shrink-0 hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <GlobalHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50 dark:bg-gray-900/50">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/timelog" element={<TimeLogPage />} />
            {/* Redirect any unknown paths to the dashboard */}
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AppInitializer: React.FC = () => {
  const { clients, loading } = useAppData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner className="w-12 h-12 text-primary" />
      </div>
    );
  }

  // If there are no clients, it's the user's first time.
  if (clients.length === 0) {
    return (
      <Routes>
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  return <AppLayout />;
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppDataProvider>
          <Router>
            <AppInitializer />
          </Router>
        </AppDataProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;