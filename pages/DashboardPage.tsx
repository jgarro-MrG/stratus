import React, { useState, useMemo } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { Client, Project, TimeEntry } from '../types';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';


const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress';
    const durationMs = end.getTime() - start.getTime();
    if (durationMs < 0) return '0h 0m';
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const RecentActivityItem: React.FC<{ entry: TimeEntry & { startTime: Date, endTime: Date | null }, project?: Project, client?: Client }> = ({ entry, project, client }) => {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="font-semibold text-text-primary">{entry.description || 'No description'}</p>
                <p className="text-sm text-text-secondary">
                    {project?.name || 'Unknown Project'} ({client?.name || 'Unknown Client'})
                </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="font-semibold text-text-primary">{formatDuration(entry.startTime, entry.endTime)}</p>
                <p className="text-sm text-text-secondary">{format(entry.startTime, 'MMM d')}</p>
            </div>
        </div>
    );
};


interface BatchEntry {
    id: string;
    projectId: string;
    description: string;
    startTime: string;
    endTime: string;
}

const DashboardPage: React.FC = () => {
    const { timeEntries, projects, clients, loading, addBatchManualTimeEntries } = useAppData();
    const { addToast } = useToast();
    
    // State for manual entries modal (batch)
    const [isManualEntriesModalOpen, setIsManualEntriesModalOpen] = useState(false);
    const [batchEntries, setBatchEntries] = useState<BatchEntry[]>([{ id: uuidv4(), projectId: '', description: '', startTime: '', endTime: '' }]);

    
    const projectMap = new Map(projects.map(p => [p.id, p]));
    const clientMap = new Map(clients.map(c => [c.id, c]));

    const recentEntries = timeEntries.filter(e => !e.isArchived).slice(0, 10);

    const projectOptions = useMemo(() => {
        const activeProjects = projects.filter(p => !p.isArchived);
        const clientMap = new Map(clients.map(c => [c.id, c.name]));
        
        return activeProjects.map(p => ({
          ...p,
          clientName: clientMap.get(p.clientId) || 'Unknown Client'
        }));
    }, [projects, clients]);

    // Batch Entry Handlers
    const resetBatchForm = () => {
        setBatchEntries([{ id: uuidv4(), projectId: '', description: '', startTime: '', endTime: '' }]);
    }

    const handleAddBatchRow = () => {
        setBatchEntries(prev => [...prev, { id: uuidv4(), projectId: '', description: '', startTime: '', endTime: '' }]);
    };

    const handleRemoveBatchRow = (id: string) => {
        setBatchEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const handleBatchInputChange = (id: string, field: keyof Omit<BatchEntry, 'id'>, value: string) => {
        setBatchEntries(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    };

    const handleSaveBatch = async () => {
        const entriesToSave: Omit<TimeEntry, 'id' | 'isArchived'>[] = [];
        
        for (const entry of batchEntries) {
            if (!entry.projectId || !entry.description.trim() || !entry.startTime || !entry.endTime) {
            addToast('Please fill all fields for all entries.', 'warning');
            return;
            }
            const start = new Date(entry.startTime);
            const end = new Date(entry.endTime);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            addToast('Invalid date or time format found.', 'error');
            return;
            }
            
            if (start >= end) {
            addToast('End time must be after start time for all entries.', 'warning');
            return;
            }

            entriesToSave.push({
                projectId: entry.projectId,
                description: entry.description.trim(),
                startTime: start.toISOString(),
                endTime: end.toISOString(),
            });
        }

        if (entriesToSave.length === 0) {
            addToast('No entries to save.', 'info');
            return;
        }

        try {
            await addBatchManualTimeEntries(entriesToSave);
            addToast(`${entriesToSave.length} ${entriesToSave.length > 1 ? 'entries' : 'entry'} added successfully.`, 'success');
            setIsManualEntriesModalOpen(false);
            resetBatchForm();
        } catch (e) {
            console.error(e);
            addToast('Failed to add batch entries.', 'error');
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                <div>
                    <button
                        onClick={() => setIsManualEntriesModalOpen(true)}
                        className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Add Manual Entries
                    </button>
                </div>
            </div>
            
            <Card title="Recent Activity">
                {loading ? (
                    <p>Loading...</p>
                ) : recentEntries.length > 0 ? (
                    <div className="divide-y divide-border">
                        {recentEntries.map(entry => {
                            const project = projectMap.get(entry.projectId);
                            const client = project ? clientMap.get(project.clientId) : undefined;
                            return <RecentActivityItem key={entry.id} entry={entry} project={project} client={client} />
                        })}
                    </div>
                ) : (
                    <p className="text-text-secondary">No recent time entries found.</p>
                )}
            </Card>

            {/* Manual Entries Modal (Batch) */}
            <Modal isOpen={isManualEntriesModalOpen} onClose={() => { setIsManualEntriesModalOpen(false); resetBatchForm(); }} title="Add Manual Time Entries" size="4xl">
                <div className="space-y-4">
                    <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 space-y-3">
                        {batchEntries.map((entry, index) => (
                            <div key={entry.id} className="grid grid-cols-12 gap-3 items-start p-3 border border-border rounded-lg">
                                <div className="col-span-12 md:col-span-3">
                                    {index === 0 && <label className="block text-sm font-medium text-text-secondary mb-1">Project</label>}
                                    <select
                                        value={entry.projectId}
                                        onChange={(e) => handleBatchInputChange(entry.id, 'projectId', e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select project</option>
                                        {projectOptions.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    {index === 0 && <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>}
                                    <input
                                        type="text"
                                        value={entry.description}
                                        onChange={(e) => handleBatchInputChange(entry.id, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Work description"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    {index === 0 && <label className="block text-sm font-medium text-text-secondary mb-1">Start Time</label>}
                                    <input
                                        type="datetime-local"
                                        value={entry.startTime}
                                        onChange={(e) => handleBatchInputChange(entry.id, 'startTime', e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    {index === 0 && <label className="block text-sm font-medium text-text-secondary mb-1">End Time</label>}
                                    <input
                                        type="datetime-local"
                                        value={entry.endTime}
                                        onChange={(e) => handleBatchInputChange(entry.id, 'endTime', e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className={`col-span-12 md:col-span-2 flex items-end h-full ${index > 0 ? 'md:mt-0' : 'md:pt-7'}`}>
                                    <button 
                                        onClick={() => handleRemoveBatchRow(entry.id)} 
                                        disabled={batchEntries.length <= 1}
                                        className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-text-secondary disabled:border-border"
                                        aria-label="Remove entry"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleAddBatchRow} className="text-sm font-semibold text-primary hover:text-primary-dark">+ Add another entry</button>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-border mt-4">
                        <button onClick={() => { setIsManualEntriesModalOpen(false); resetBatchForm(); }} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button>
                        <button onClick={handleSaveBatch} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark">Save Entries</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardPage;