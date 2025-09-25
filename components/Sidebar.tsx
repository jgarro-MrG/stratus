import React from 'react';
import { NavLink } from 'react-router-dom';

const ClockIcon = () => (
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAKUklEQVR4nO3d3W4jxxYA4L3/Tz3A7WBr0wS2iUt3p7uQ4oJAFkgiW3kC2o426QIsY/QvYg0tSZZkSZZ9fWlOAEgCgZCQ8fF+FwLgfN4/f/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwH9O5/f7/fHx8fPz8+f/T/x+P+Pz+Tz/4/P7/T7f7/f9fn8+n4/f7/c3+/3+p9/v9/f7f/759vP5/H1+/7/u3998Pp/b+Hw+d+/3+/35/L7/a38A/hPg+p3Z/Pz8/P/j+3/P4+1+f//8/f3v39/fn5+fN/f5/f1v/35/Pl9v9/v9/v7u/X5/fn++/9++3/f7/f12P7+f/f79/f1u/n73+f0+v9/f/m7f3/7m8/3+e/D6/Xv3+/3n/9v3x+f/e3z+/vP5/X+7P/95f/5++/35/f39+f75u/+f7vP9+f399f5++/399v37/ev3/5+v6/d7fX4+H+7z+f55vr/f73e/f7/ft7sH5/v3r/f7/evP5//38/fn1+83d31+/7n/H9/fX+76/X1+/X4/f/95n9+f398/3+7f/3/7/X//e/L+fX9//978P5/v/9+/v/39/f5/f79/vj8+Xv9+P38+n/fv//f3//vX+vP79/n8/f793l+///r/v/+9f/3+fn/n85/v5/f//fH5+/f7e/7+9//t//3m/f//e//+///n/f/9+//1+3//u/f//ffr//d/P//79/v9/f/9/v3v39/f/97v3++v//fvX+/f79/vj/9/f/++v//e/7+//1+/3+//3+//77f///+f7+//9/36/fz/6/fz+//5+f/n5/ef79+//1+/v9+v//5/v/+f/9+v//9+//5+f/+9///v7+/f7+/v9+/39/vr9/vr//f7+/P3/f/P/n/+v/9/v5/f//eP78ff/n9/f7++///+/n9+///f7++/78//3+//z+ff/+//3+//z/7/f/9+//9/vr//v5//78+v/+f/+/f3+/v/7///P/+f//+/n/+fv5/v3+/f/+/f7+/v7///P//f/+/f5/P7//39/f/+9/f7+///7+/f/+/v/++f/+///P/9f//7/f/7+//+//78/v/+fn//v/+/P//f/+fn5/P/7//f//8//7///75+f7+//7+/f/+///+/f/+/v/+///+//78//7+/v79/v7//n5+//1+f3//v//f/+///+//5//n//f/9+v5//3+//36/v78/f7//P/+fv3+/v3+//z//v/+f/+/v//eP/+fn//P/+f/++/7///7///P//f7++v5+/v7+/v79+f5+/f5+//78/f/+/f3+/v/++/7+//7+/P/n/+fn++v/9+///+//9+/v9/f79/v/9+///f7//P3++v/n//f/+///+/P3+/v9+//7///7+/P//f//n//f/+fn+///e39/f//f/+/P//f/9+fn9+/P3+//7//3//v3++fn//v3//n5+//n//v35+//n/+/3//P//fv/+/P/+f/5/vr9+fn/+fn5/P/+fn//v/9+f5//3++/v//fvz//v//f//n//v//v/+f//n/+v/+/P/+/P3+/v78/v5/fn/+///+/v/+///+/P7//P7//v7//n7//v/9+v3+fn9+//7//f//8///e//7//P5//37//v//ff/+/f/+f/++/7//f/9+f5//78/f///+/v3+//5/f3//f//fv/+///+/f39+/z9+/37/P7+//7//n5+f//fv3///f/9+/z+///+f//+/f7+fn/+f/5+/z9+//7//v5//v9///z//v//+/z+/v5+/v5/fn/+v//f/+/3//v3//v/+fn/+f//e//7/P3//v/+/v/9/P7+f39//z//v3+/v7+/v/++f//+/f/9+/37/P/8///+/v7+/v5+/v/n//P/+/v7//n/+v3+///+/f/+f//fP//f/+fn9+fn9+///+/f3//P/+///+/P/+/f5+f/+fv/9+f/9/v5+f79+//3+///+//78/v//fn9+/v//fn//f//+/P/+//7//v/+/P/+/v3+/f/9//n/+f/+///+//5+/v5+/v/+///+//79/v/+//5/P7+/3+/f//fn9+/3//Pz+fn9+/3/+///+/f//+v/+///+//7/f/9+f/9+//7///7///5//v7/fn//f//+/Pz//f3+///+/v/+///+/v39//z8//7/fv/9+fn9//z+///+f35+/39+/3/+fv5+//7//n/+f//+/v5+/3/+/f/+///+//z8//z//Pz+/v/+///+/f/8+//+///+//5+//7+/P7///78//7/fv9/fn/+//5///z+/Pz//v/+fn//f/9+//7///7//P/+/v/9///9/v7+/P/+///+//7/fv/+///+//z//v/+/P/+/P7//P7///7//v/9/v7+/f7+/v5///5+///+///+/f/+///9/v7+/v7+/v/+f/1+//79/v/+/P5+fn/+f/5+fn/+fv/+///+//7///7//P/8///+//5//v5+/v/+///+//z+/v5+//5+//5/f/++///+/f39/f3//f3++v3+fn5+/3/+fv7/fn9/f/9//v5+//7///7+/P/8/v78/v/+f/5+/3/+fn9+//5+//5+//7/f//+/f39/f7+/v/+///+//5+//5+f/9+/v/+f/9+fn/+fn9/f/9/fn/+///+/f/+/Pz+/v7/f//e//z+/v/+/f/9/v/+/Pz+/Pz+/Pz//v/9+//7+/v7+/v/+f/1+f/9+//7+/v5+//7/fv5+//7//Pz+/f39/f7//v/+f/5+//5+///+/v/+///+//5+//5/f/++///eP//f3//f/+///+//z+//7+/v/+/f39/f7///7//P/+/f39/f7//v/+f/7+/v5+//78/v5//v/+fv7+//7///5//v/+fn/+f//+/v7+/v7//v7//v39+//78/v/+fn//P39+/z9/f3+///+//5///5+///+//5///5+//5+//5/f//+/P39//z+/P7//P7//P79/v/+f//+f39///9//v/+/f39///+/P39/f7+/f/9/f7+/v7+/f/9+/z9/f39/f7//P79+/z9+//7+//7+/v7///78///+/P39///+/v7//v7+//7//v7//v7+/v7+/v7+/v/9+//7+/P19/f7//v5//v5+///e//7+//5+/v/+/P39/f7///7+/P39/f7+/f/9/f7+/f7+/f7+/f/9/f/9/f7+/f7+fn9//z9///9+fn//P/+///+/P39///9+//5+//5+f3/+f//eP//f39///9+f39+//5+/v/+///+/P/+f/5/f/9//v5///9+f/9+f39+//5+//7+//5+//5+//5+//5+f3/+fn/+fn/+f//+/P/+f/5/f//+f//+/v/9/f5+fn/+f/7/f/9///9+f3/+f/7+/f39/f39/f/9/f/9/f/+///eP//f39///9+//5+//5+//7+//5+/v/+f//+/P39//z//P79/v/+fv/+f39/f39/f//+/f39/f/9///9+//5+//7+/v7//v/+f/1+//7+/v7+/v7//P79/v7//v7+/v7//f/+f39//79/v/8+//7///7+/f/+f//e//7+//5+//7///78//7+/v7//P7+/v/9/f39/f7+/f/9+/z9/f39/f/+f/5+//7+/f7+/v7+/v5//r5+//7//v7//v/+f//+/v7+//78//78/v/+fn/+f//+/P/+/v7+/v/+f/7/f//e///+/v/+///+/f/+fn/+fv/+fn5///9/f//e//z+/P/+/f/+f/7//P39/f7+/f7//P7+/f/+fv7//v7//v7//f39/f/9//z8//z8/f/+fn9+/3/+fv5//v5+//5///9///9/f/++/z//v39/f/9+//5+//7+//7+//5+//5+//7/f/7//P79+//7+//7//v7+/f39///9+//5+//5+f39/f/++///+//5//v79+//7+//5+/f/9//z8+//7+//5+//7///7+/v/+///+///+//5+/v/+fn9+/3/+f/5//v/9///9+fn/+fn//f//+/P39/f39//z+/P/+///+/v7+/v/+f/7+/v/+///+/v7+//7+/v7+/f/+/v/9/f39/f/9/f/9///+///+/v/+///+/v/+f/7+/v/9/f39/f7+/f/+fv/+f39/f39///+///+f//+/v79/v7+/v/9+//7/f/9+v3+///+/P39+//7//n5+fn9+/3/+f/5/f3/+v/+/P7//v7+/v7//f/9+v3+/v7+/f39///+/v7+//7///7+/v/+/P39+//7//v7+//7//v/9///9///9///9//v7+/P7+/f39/f39/f/9/f/+fv/+f//+//7/fn/+f/7/f/9///+/v/+/P39//z+/P79+//7+/v7//v7//v7//v/9//v/9///9/v79/v79///9+/v7//v7+/P7//P7+/P39///9+//7+/f/9+//7//n5+/v7+/v/+fn9//z+///+///+/v7//v7//v7//f/9+/z9+//7+//7+/v7+/f/+fv7+/v7//v/+fn/+f/7+/v7+//7//P79/v/+f/7+/v7+//7///7+/v/+///+/v/9/f/+fv7+/v/+f//eP//f39///9//v/+fv7+/v7+//5+//7+//7+/v7+/v7+/f7+/f/9+/z9+/z9+//7+//7+//7//P7+/v7+/v7+/v/9+//7+/v7+//78//78/f78/f39///9///9///9///9//v/9///9//v7+/v79/v79+//7+//7+//7+/v7//v/+fv7+/f7+/f7+/f39/f39/f39///9///+/v/+fv7+//5+//5+f39///+/v7+/v7+/v7+/v7+/v7//v/+fv7+/v7+/f/9/f/9/f7+fn9+//5+//5+/v/+fv/+f//+/v/9/f39///9//v7+///+//78/v/+f//+///+///+///+/v7+/v7//v/+fv7+//7+//5///7+/v7+/v7+/v/+/v/9/f39/f39//z+/P79+//7//P79+//7/P39+//7+//7+/v7//v/+fn9+//7//v7+///+/P39+//78/v7//v7+/v/+fv/+fn5///9//v7+/v7//v7//v7//P7+/v7+/f39///+///+/v7+/v7+/f/+///+/f/+/v7+/v/+///+/v/+///eP//f39/f39///9//v/+/v/+///eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgH/4Pz/25lY+wAAAABJRU5ErkJggg==" alt="Stratus Time Tracker Logo" className="h-8 w-8" />
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