import React, { useEffect } from 'react';
import { useDataStore } from '../contexts/DataStoreContext';
import { RecentFile } from '../services/fileSystem';

const DocumentPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3h-6m-1.5-6H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const FolderOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0a2.25 2.25 0 0 1-2.25-2.25V5.25A2.25 2.25 0 0 1 3.75 3h5.25a2.25 2.25 0 0 1 2.25 2.25v1.5m0 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5M3.75 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h12A2.25 2.25 0 0 0 20.25 17.25v-7.5" />
    </svg>
);

const DocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m-1.5 12H12m0 0h3.75m-3.75 0V15m0 3.75v-3.75m0 0H8.25m9.75-12h-3.75a1.125 1.125 0 0 1-1.125-1.125V3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125Z" />
    </svg>
);


const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


const formatRelativeDate = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, 'hour');
    const days = Math.floor(hours / 24);
    return rtf.format(-days, 'day');
};

const RecentItem: React.FC<{ item: RecentFile, onOpen: () => void, onForget: () => void }> = ({ item, onOpen, onForget }) => {
    return (
        <li className="flex items-center justify-between p-3 bg-background/50 dark:bg-surface/20 rounded-lg group">
            <div className="flex items-center gap-4 min-w-0">
                <DocumentIcon className="h-8 w-8 text-primary/70 flex-shrink-0" />
                <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate" title={item.path}>{item.name}</p>
                    <p className="text-sm text-text-secondary">Last opened: {formatRelativeDate(item.lastAccessed)}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onForget} className="p-2 text-text-secondary hover:text-red-500 rounded-md hover:bg-red-500/10" aria-label={`Forget ${item.name}`}>
                    <TrashIcon className="h-5 w-5"/>
                </button>
                <button onClick={onOpen} className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-dark">Open</button>
            </div>
        </li>
    );
};


const LandingPage: React.FC = () => {
    const { createNewDataFile, openDataFile, recentFiles, loadRecents, openRecentDataFile, forgetFile, isLoading, error } = useDataStore();

    useEffect(() => {
        loadRecents();
    }, [loadRecents]);

    const ActionButton: React.FC<{onClick: () => void, icon: React.ReactNode, title: string, disabled: boolean}> = ({onClick, icon, title, disabled}) => (
         <button
            onClick={onClick}
            disabled={disabled}
            className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {icon}
            <span className="font-semibold">{title}</span>
        </button>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-2xl mx-auto animate-scaleUp">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-text-primary">Stratus Time Tracker</h1>
                    <p className="text-text-secondary mt-2">Your data is stored in a single local file. Get started below.</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left side: Actions */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-3">Start or Open a File</h2>
                        <div className="space-y-4">
                           <ActionButton onClick={createNewDataFile} icon={<DocumentPlusIcon className="h-12 w-12 mb-2" />} title="Create New Data File" disabled={isLoading} />
                           <ActionButton onClick={openDataFile} icon={<FolderOpenIcon className="h-12 w-12 mb-2" />} title="Open Existing File" disabled={isLoading} />
                        </div>
                    </div>

                    {/* Right side: Recents */}
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary mb-3">Open Recent</h2>
                        {recentFiles.length > 0 ? (
                             <ul className="space-y-2">
                                {recentFiles.map(item => (
                                    <RecentItem
                                        key={item.path}
                                        item={item}
                                        onOpen={() => openRecentDataFile(item.path)}
                                        onForget={() => forgetFile(item.path)}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center p-6 border border-border rounded-xl text-text-secondary">
                                <p>No recent files found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;