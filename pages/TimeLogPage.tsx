import React, { useState, useMemo, ChangeEvent } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ActionMenu from '../components/ActionMenu';
import { TimeEntry } from '../types';
import { format, differenceInMilliseconds } from 'date-fns';

type TimeEntryWithDates = TimeEntry & { startTime: Date; endTime: Date | null };

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <label htmlFor="toggle-timelog" className="flex items-center cursor-pointer">
        <div className="relative">
            <input id="toggle-timelog" type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition ${checked ? 'bg-primary' : 'bg-border'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ml-3 text-text-secondary font-medium">{label}</div>
    </label>
);

const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress';
    const durationMs = differenceInMilliseconds(end, start);
    if (durationMs < 0) return '0h 0m';
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const formatForDateTimeLocal = (date: Date | string | null): string => {
    if (!date) return '';
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        // This format is required by <input type="datetime-local" />
        return format(d, "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
        return '';
    }
};

const TimeLogPage: React.FC = () => {
    const { timeEntries, projects, clients, updateTimeEntry, deleteTimeEntry, addBatchManualTimeEntries } = useAppData();
    const { addToast } = useToast();

    // View state
    const [showArchived, setShowArchived] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntryWithDates | null>(null);
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Form states
    const [newEntry, setNewEntry] = useState({ projectId: '', description: '', startTime: '', endTime: '' });

    // Confirmation modal state
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: async () => {}, confirmText: 'Confirm', isDestructive: false });

    const openConfirmModal = (config: Omit<typeof modalConfig, 'onConfirm'> & { onConfirm: () => Promise<void> }) => {
        setModalConfig(config);
        setIsConfirmModalOpen(true);
    };

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
    const projectOptions = useMemo(() => {
        return projects
            .filter(p => !p.isArchived)
            .map(p => ({
                id: p.id,
                name: `${p.name} (${clientMap.get(p.clientId) || 'Unknown Client'})`
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [projects, clientMap]);

    const filteredEntries = useMemo(() =>
        timeEntries
            .filter(e => e.isArchived === showArchived)
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()),
    [timeEntries, showArchived]);

    const handleEditStart = (entry: TimeEntryWithDates) => {
        setEditingEntry(JSON.parse(JSON.stringify(entry))); // Deep copy
    };

    const handleEditCancel = () => {
        setEditingEntry(null);
    };

    const handleEditSave = async () => {
        if (!editingEntry) return;

        const start = new Date(editingEntry.startTime);
        const end = editingEntry.endTime ? new Date(editingEntry.endTime) : null;

        if (!end || start >= end) {
            addToast('End time must be after start time.', 'warning');
            return;
        }

        const updates: Partial<TimeEntry> = {
            projectId: editingEntry.projectId,
            description: editingEntry.description,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        };

        await updateTimeEntry(editingEntry.id, updates);
        addToast('Entry updated successfully!', 'success');
        setEditingEntry(null);
    };
    
    const handleFieldChange = (field: keyof TimeEntryWithDates, value: string) => {
        if (!editingEntry) return;
        setEditingEntry(prev => ({ ...prev!, [field]: value }));
    };
    
    const handleNewEntryChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({...prev, [name]: value}));
    };
    
    const handleAddNewEntry = async () => {
        if (!newEntry.projectId || !newEntry.description.trim() || !newEntry.startTime || !newEntry.endTime) {
            addToast('Please fill all fields.', 'warning');
            return;
        }
        const start = new Date(newEntry.startTime);
        const end = new Date(newEntry.endTime);

        if (start >= end) {
            addToast('End time must be after start time.', 'warning');
            return;
        }

        await addBatchManualTimeEntries([{
            ...newEntry,
            startTime: start.toISOString(),
            endTime: end.toISOString()
        }]);
        addToast('New entry added!', 'success');
        setIsAddModalOpen(false);
        setNewEntry({ projectId: '', description: '', startTime: '', endTime: '' });
    };

    const renderTableBody = () => {
        if (filteredEntries.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="text-center py-16 text-text-secondary">
                        {showArchived ? 'No archived time entries found.' : 'No active time entries found.'}
                    </td>
                </tr>
            );
        }
        return filteredEntries.map(entry => {
            const isEditing = editingEntry?.id === entry.id;
            const project = projectMap.get(entry.projectId);
            const clientName = project ? clientMap.get(project.clientId) : 'Unknown';

            return (
                <tr key={entry.id} className={`border-b border-border last:border-b-0 ${isEditing ? 'bg-primary/5' : ''}`}>
                    <td className="p-3 align-top">
                        {isEditing ? (
                            <select
                                value={editingEntry.projectId}
                                onChange={(e) => handleFieldChange('projectId', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Select project</option>
                                {projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        ) : (
                            <div>
                                <p className="font-medium text-text-primary">{project?.name || 'Unknown Project'}</p>
                                <p className="text-sm text-text-secondary">{clientName}</p>
                            </div>
                        )}
                    </td>
                    <td className="p-3 align-top">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editingEntry.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        ) : (
                            <p className="text-text-primary">{entry.description}</p>
                        )}
                    </td>
                    <td className="p-3 align-top">
                        {isEditing ? (
                            <input
                                type="datetime-local"
                                value={formatForDateTimeLocal(editingEntry.startTime)}
                                onChange={(e) => handleFieldChange('startTime', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        ) : (
                            <p className="text-text-secondary">{format(entry.startTime, 'MMM d, yyyy, p')}</p>
                        )}
                    </td>
                    <td className="p-3 align-top">
                        {isEditing ? (
                             <input
                                type="datetime-local"
                                value={formatForDateTimeLocal(editingEntry.endTime)}
                                onChange={(e) => handleFieldChange('endTime', e.target.value)}
                                className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        ) : (
                            <p className="text-text-secondary">{entry.endTime ? format(entry.endTime, 'p') : '-'}</p>
                        )}
                    </td>
                    <td className="p-3 align-top text-right font-semibold text-text-primary">{formatDuration(entry.startTime, entry.endTime)}</td>
                    <td className="p-3 align-top">
                        <div className="flex justify-end items-center gap-1">
                            {isEditing ? (
                                <>
                                    <button onClick={handleEditSave} className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary-dark">Save</button>
                                    <button onClick={handleEditCancel} className="px-3 py-1 text-sm rounded-md border border-border hover:bg-background">Cancel</button>
                                </>
                            ) : (
                                 <ActionMenu items={showArchived ? [
                                    { label: 'Unarchive Entry', onClick: () => updateTimeEntry(entry.id, { isArchived: false }) },
                                    { label: 'Delete Permanently', isDestructive: true, onClick: () => openConfirmModal({
                                        title: 'Delete Time Entry?',
                                        message: `This will permanently delete the time entry: "${entry.description.substring(0, 50)}...". This action cannot be undone.`,
                                        onConfirm: async () => deleteTimeEntry(entry.id),
                                        confirmText: 'Delete Entry',
                                        isDestructive: true,
                                    })}
                                ] : [
                                    { label: 'Edit', onClick: () => handleEditStart(entry) },
                                    { label: 'Archive Entry', onClick: () => updateTimeEntry(entry.id, { isArchived: true }) }
                                ]} />
                            )}
                        </div>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Time Log</h1>
                <div className="flex items-center gap-4">
                    <ToggleSwitch checked={showArchived} onChange={setShowArchived} label={showArchived ? "Viewing Archived" : "Viewing Active"} />
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Add New Entry
                    </button>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-background border-b border-border">
                            <tr>
                                <th className="p-3 font-semibold text-text-secondary w-1/4">Project</th>
                                <th className="p-3 font-semibold text-text-secondary w-1/3">Description</th>
                                <th className="p-3 font-semibold text-text-secondary">Start Time</th>
                                <th className="p-3 font-semibold text-text-secondary">End Time</th>
                                <th className="p-3 font-semibold text-text-secondary text-right">Duration</th>
                                <th className="p-3 font-semibold text-text-secondary text-right w-[140px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableBody()}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title={modalConfig.title}>
                <p className="text-text-secondary mb-6">{modalConfig.message}</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button>
                    <button 
                        onClick={() => { modalConfig.onConfirm(); setIsConfirmModalOpen(false); }}
                        className={`px-4 py-2 rounded-lg text-white ${modalConfig.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}
                    >
                        {modalConfig.confirmText}
                    </button>
                </div>
            </Modal>
            
            {/* Add New Entry Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Time Entry">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Project</label>
                        <select name="projectId" value={newEntry.projectId} onChange={handleNewEntryChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Select project</option>
                            {projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                        <input type="text" name="description" value={newEntry.description} onChange={handleNewEntryChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="What did you work on?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Start Time</label>
                             <input type="datetime-local" name="startTime" value={newEntry.startTime} onChange={handleNewEntryChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">End Time</label>
                             <input type="datetime-local" name="endTime" value={newEntry.endTime} onChange={handleNewEntryChange} className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                     <div className="flex justify-end space-x-2 pt-4">
                         <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button>
                         <button onClick={handleAddNewEntry} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark">Add Entry</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TimeLogPage;
