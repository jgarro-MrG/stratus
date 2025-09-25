import React, { useState, useRef, useEffect } from 'react';

const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

interface ActionItem {
    label: string;
    onClick: () => void;
    isDestructive?: boolean;
}

interface ActionMenuProps {
    items: ActionItem[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-background text-text-secondary hover:text-text-primary">
                <MoreIcon />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg border border-border z-10 animate-fadeIn">
                    <ul className="py-1">
                        {items.map((item, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => {
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                        item.isDestructive
                                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50'
                                            : 'text-text-primary hover:bg-background'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;
