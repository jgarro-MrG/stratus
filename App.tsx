import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataStoreProvider, useDataStore } from './contexts/DataStoreContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ProjectsPage from './pages/ProjectsPage';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataStoreProvider>
        <HashRouter>
          <Main />
        </HashRouter>
      </DataStoreProvider>
    </ThemeProvider>
  );
};

const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const FullScreenLoader: React.FC = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
);


const Main: React.FC = () => {
  const { isReady, isLoading } = useDataStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isReady) {
    return <LandingPage />;
  }

  return (
    <div className="flex h-screen bg-background text-text-primary">
        <>
          {/* Overlay for mobile */}
          <div
            className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
          {/* Sidebar */}
          <div
            className={`app-sidebar fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-300 ease-in-out md:relative md:w-64 md:flex-shrink-0 md:translate-x-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            role="dialog"
            aria-modal={isSidebarOpen}
          >
            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </>
      <main className="app-main-content flex-1 flex flex-col overflow-y-auto">
          <header className="app-mobile-header md:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-text-primary p-1"
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
             <h1 className="text-xl font-bold text-primary">Stratus Time Tracker</h1>
             <div className="w-8"></div> {/* Spacer to center title */}
          </header>
        <div className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;