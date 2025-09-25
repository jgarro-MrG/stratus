import React from 'react';
import { NavLink } from 'react-router-dom';

const ClockIcon = () => (
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAKYklEQVR4nO3dfYxcVRXG8c8vW2lRoU2oQJOGoJBYbEQkEAuhYEQDCRbaxMSl1mLiEonRBBP8oUaNid/UREwMIaG1sTEhxC1I1Ghi00CIBj+Y0CgQay2KQi2wFdqu7T0zX/c23G63e++9e7P3fr/kk3dm5sy5c86cOeeec869FwEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAYH4jN7vd7nQ6/f39/fn5+fn5+fn5+fN4PO50Ol+v13farre7fX6/3+v1up7f5/N5n8/nd7vdf7/fb7fbfT6/32az+brf77db/b9j//h8Pq/X693p9Pn9fq/X653f2h/AHwOufzObz8/P/z9+/5/z+Hw+n8/n8/l8Pj8/P5/P5+fzeXw+n8/nd7vd7/f73W73+Xw+n8/Pz/P5/P5+v35+/+Pz+Tyez+fz+Xw+n8/n8/l8Pp/P5/P5/P5+v/7++f39/f35+fn5+fn5+b/P77/P5/d7vX7/+vz8+fn5+f7x+X3e5+f3z/P5/fvz+/P9/P78fv94fX6//n5/fnx+vn98ft7Pz/f/+vP5+f7x+fn++fn94/v5/vH5+fn++fz++fn9/vP94/P5/fP5eT/ff57f/36/38/vx/fz+/n9/fn5/f3++X7/fH++/37/eD8/P39+Pz8/Pz8/Pz8/P78/P9/f7/cP8/v94/3+8/v9f/+4z8/v/w/n+fn++/1+/3h8fn+++f79/f1+/36/P78/v78/v5+f38/vz+/Pz8/P7+/Pz/cP8/vx/fn++/n++/n9/vP9/v7++fn5+fn5+vn++/39+v1+/X5/v3+83++/33++v/7+fr+/X6/fz+8/z+fn++fn5/cP8/vx/fz++f79/v5+f39/v5+/X6/fr9/vz8+fn+/v7++fn++vn++v9/f7z+f3++fzz+f3n8/vz+/P7++fn+/v7+3//+fn5ffv94/n/++P38fv94fn5+fnx+/+PzeT8/vz8/Pz8/v/88f/94fH9//+Pz/x9v/w8AwEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAgB+BwF4gC3I3dZIAAAAASUVORK5CYII=" alt="Stratus Time Tracker Logo" className="h-10 w-10" />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const ListBulletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
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
                <h1 className="text-xl font-bold text-primary">Stratus Time Tracker</h1>
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
                <NavLink to="/timelog" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
                    <ListBulletIcon />
                    <span>Time Log</span>
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
        </div>
    );
};

export default Sidebar;