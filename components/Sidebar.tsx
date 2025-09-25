import React from 'react';
import { NavLink } from 'react-router-dom';
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
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const Sidebar: React.FC = () => {
    const navLinkClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200";
    const activeClass = "bg-primary text-white";
    const inactiveClass = "text-text-secondary hover:bg-primary/10 hover:text-primary";

    return (
        <div className="w-full h-full bg-surface border-r border-border flex flex-col p-4">
            <div className="flex items-center space-x-2 px-4 mb-8">
                <ClockIcon />
                <h1 className="text-2xl font-bold text-primary">Stratus Time Tracker</h1>
            </div>

            <nav className="flex-1 space-y-2">
                <NavLink to="/" end className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
                    <ChartBarIcon />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/projects" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
                    <FolderIcon />
                    <span>Projects</span>
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
                    <ChartBarIcon />
                    <span>Reports</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
                    <SettingsIcon />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div className="mt-auto">
              <ThemeSwitcher />
            </div>
        </div>
    );
};

export default Sidebar;