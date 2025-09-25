import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDataStore } from '../contexts/DataStoreContext';
import { ThemeSwitcher } from './ThemeSwitcher';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);
const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const GoBackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);


interface SidebarProps {
  onNavigate: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
    const { resetDataStore } = useDataStore();
    const navLinkClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200";
    const activeClass = "bg-primary text-white";
    const inactiveClass = "text-text-secondary hover:bg-primary/10 hover:text-primary";

    const handleCloseFile = () => {
      onNavigate();
      resetDataStore();
    }

    return (
        <div className="w-full h-full bg-surface border-r border-border flex flex-col p-4">
            <div className="flex items-center space-x-2 px-4 mb-8">
                <ClockIcon />
                <h1 className="text-2xl font-bold text-primary">Stratus Time Tracker</h1>
            </div>

            <nav className="flex-1">
                <NavLink to="/" end className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`} onClick={onNavigate}>
                    <ChartBarIcon />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/projects" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`} onClick={onNavigate}>
                    <FolderIcon />
                    <span>Projects</span>
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`} onClick={onNavigate}>
                    <ChartBarIcon />
                    <span>Reports</span>
                </NavLink>
            </nav>

            <div className="space-y-4 px-2">
               <button
                  onClick={handleCloseFile}
                  className={`${navLinkClasses} w-full ${inactiveClass}`}
                >
                  <GoBackIcon />
                  <span>Switch / Close File</span>
                </button>
              <ThemeSwitcher />
            </div>
        </div>
    );
};

export default Sidebar;