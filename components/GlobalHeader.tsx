import React from 'react';
import Timer from './Timer';

const GlobalHeader: React.FC = () => {
    return (
        <header className="flex-shrink-0 bg-surface border-b border-border p-4">
            <div className="max-w-7xl mx-auto">
                <Timer />
            </div>
        </header>
    );
};

export default GlobalHeader;
