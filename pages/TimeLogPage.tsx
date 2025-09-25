import React, { useState, useMemo, ChangeEvent } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ActionMenu from '../components/ActionMenu';
import { TimeEntry } from '../types';
import { format, differenceInMilliseconds } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useFormatting } from '../hooks/useFormatting';

type TimeEntryWithDates = TimeEntry & { startTime: Date; endTime: Date | null };

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

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
        return format(d, "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
        return '';
    }
};

type BatchEntry = { key: string, projectId: string, description: string, startTime: string, endTime: string };

const TimeLogPage: React.FC = () => {
    const { timeEntries, projects, clients, updateTimeEntry, deleteTimeEntry, addBatchManualTimeEntries } = useAppData();
    const { addToast } = useToast();
    const { formatDateTime, formatTime } = useFormatting();

    // View state
    const [showArchived, setShowArchived] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntryWithDates | null>(null);
    
    // Modal states
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Form states
    const [batchEntries, setBatchEntries] = useState<BatchEntry[]>([{ key: uuidv4(), projectId: '', description: '', startTime: '', endTime: '' }]);

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
            .filter(e => !!e.isArchived === showArchived)
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()),
    [timeEntries, showArchived]);

    const handleEditStart = (entry: TimeEntryWithDates) => {
        setEditingEntry(JSON.parse(JSON.stringify(entry)));
    };

    const handleEditCancel = () => {
        setEditingEntry(null);
    };

    const handleEditSave = async () => {
        if (!editingEntry) return;
        if (!editingEntry.endTime) {
            addToast('End time cannot be empty.', 'warning');
            return;
        }
        const start = new Date(editingEntry.startTime);
        const end = new Date(editingEntry.endTime);
        if (start >= end) {
            addToast('End time must be after start time.', 'warning');
            return;
        }
        await updateTimeEntry(editingEntry.id, {
            projectId: editingEntry.projectId,
            description: editingEntry.description,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        });
        addToast('Entry updated!', 'success');
        setEditingEntry(null);
    };
    
    const handleFieldChange = (field: keyof TimeEntryWithDates, value: string) => {
        if (!editingEntry) return;
        setEditingEntry(prev => ({ ...prev!, [field]: value }));
    };

    // Batch Modal Logic
    const handleAddBatchRow = () => {
        setBatchEntries([...batchEntries, { key: uuidv4(), projectId: '', description: '', startTime: '', endTime: '' }]);
    };
    const handleRemoveBatchRow = (key: string) => {
        setBatchEntries(batchEntries.filter(e => e.key !== key));
    };
    const handleBatchChange = (key: string, field: keyof Omit<BatchEntry, 'key'>, value: string) => {
        setBatchEntries(batchEntries.map(e => e.key === key ? { ...e, [field]: value } : e));
    };
    const handleBatchSave = async () => {
        const validatedEntries = [];
        for (const entry of batchEntries) {
            if (!entry.projectId || !entry.description.trim() || !entry.startTime || !entry.endTime) {
                addToast('Please fill all fields for all batch entries.', 'warning');
                return;
            }
            const start = new Date(entry.startTime);
            const end = new Date(entry.endTime);
            if (start >= end) {
                addToast(`Entry "${entry.description.substring(0,20)}..." has an end time before its start time.`, 'warning');
                return;
            }
            validatedEntries.push({
                projectId: entry.projectId,
                description: entry.description,
                startTime: start.toISOString(),
                endTime: end.toISOString()
            });
        }
        if (validatedEntries.length > 0) {
            await addBatchManualTimeEntries(validatedEntries);
            addToast(`${validatedEntries.length} entries added successfully!`, 'success');
            setIsBatchModalOpen(false);
            setBatchEntries([{ key: uuidv4(), projectId: '', description: '', startTime: '', endTime: '' }]);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Time Log</h1>
                <div className="flex items-center gap-4">
                    <ToggleSwitch checked={showArchived} onChange={setShowArchived} label={showArchived ? "Viewing Archived" : "Viewing Active"} />
                    <button onClick={() => setIsBatchModalOpen(true)} className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">Add New Entries</button>
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
                            {filteredEntries.length > 0 ? filteredEntries.map(entry => {
                                const isEditing = editingEntry?.id === entry.id;
                                const project = projectMap.get(entry.projectId);
                                const clientName = project ? clientMap.get(project.clientId) : 'Unknown';
                                return (
                                    <tr key={entry.id} className={`border-b border-border last:border-b-0 ${isEditing ? 'bg-primary/5' : ''}`}>
                                        <td className="p-3 align-top">{isEditing ? <select value={editingEntry.projectId} onChange={(e) => handleFieldChange('projectId', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"><option value="">Select project</option>{projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select> : <div><p className="font-medium text-text-primary">{project?.name || 'Unknown Project'}</p><p className="text-sm text-text-secondary">{clientName}</p></div>}</td>
                                        <td className="p-3 align-top">{isEditing ? <input type="text" value={editingEntry.description} onChange={(e) => handleFieldChange('description', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary" /> : <p className="text-text-primary text-xs">{entry.description}</p>}</td>
                                        <td className="p-3 align-top">{isEditing ? <input type="datetime-local" value={formatForDateTimeLocal(editingEntry.startTime)} onChange={(e) => handleFieldChange('startTime', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary" /> : <p className="text-text-secondary">{formatDateTime(entry.startTime)}</p>}</td>
                                        <td className="p-3 align-top">{isEditing ? <input type="datetime-local" value={formatForDateTimeLocal(editingEntry.endTime)} onChange={(e) => handleFieldChange('endTime', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary" /> : <p className="text-text-secondary">{entry.endTime ? formatTime(entry.endTime) : '-'}</p>}</td>
                                        <td className="p-3 align-top text-right font-semibold text-text-primary">{formatDuration(entry.startTime, entry.endTime)}</td>
                                        <td className="p-3 align-top"><div className="flex justify-end items-center gap-1">{isEditing ? <><button onClick={handleEditSave} className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary-dark">Save</button><button onClick={handleEditCancel} className="px-3 py-1 text-sm rounded-md border border-border hover:bg-background">Cancel</button></> : <ActionMenu items={showArchived ? [{ label: 'Unarchive Entry', onClick: () => updateTimeEntry(entry.id, { isArchived: false }) },{ label: 'Delete Permanently', isDestructive: true, onClick: () => openConfirmModal({ title: 'Delete Time Entry?', message: `This will permanently delete the time entry: "${entry.description.substring(0, 50)}...". This action cannot be undone.`, onConfirm: async () => deleteTimeEntry(entry.id), confirmText: 'Delete Entry', isDestructive: true, }) }] : [{ label: 'Edit', onClick: () => handleEditStart(entry) }, { label: 'Archive Entry', onClick: () => updateTimeEntry(entry.id, { isArchived: true }) }]} />}</div></td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={6} className="text-center py-16 text-text-secondary">{showArchived ? 'No archived time entries found.' : 'No active time entries found.'}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title={modalConfig.title}>
                <p className="text-text-secondary mb-6">{modalConfig.message}</p>
                <div className="flex justify-end space-x-2"><button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button><button onClick={() => { modalConfig.onConfirm(); setIsConfirmModalOpen(false); }} className={`px-4 py-2 rounded-lg text-white ${modalConfig.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}>{modalConfig.confirmText}</button></div>
            </Modal>

            <Modal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="Add New Entries" size="4xl">
                <div className="space-y-4">
                    <div className="overflow-x-auto max-h-[60vh]">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-background sticky top-0"><tr className="border-b border-border"><th className="p-2 font-semibold text-text-secondary w-1/4">Project</th><th className="p-2 font-semibold text-text-secondary w-1/3">Description</th><th className="p-2 font-semibold text-text-secondary">Start Time</th><th className="p-2 font-semibold text-text-secondary">End Time</th><th className="p-2 font-semibold text-text-secondary"></th></tr></thead>
                            <tbody>{batchEntries.map((entry, index) => (<tr key={entry.key} className="border-b border-border last:border-b-0">
                                <td className="p-2 align-top"><select value={entry.projectId} onChange={e => handleBatchChange(entry.key, 'projectId', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"><option value="">Select project</option>{projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                                <td className="p-2 align-top"><input type="text" placeholder="Description" value={entry.description} onChange={e => handleBatchChange(entry.key, 'description', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary" /></td>
                                <td className="p-2 align-top"><input type="datetime-local" value={entry.startTime} onChange={e => handleBatchChange(entry.key, 'startTime', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary" /></td>
                                <td className="p-2 align-top"><input type="datetime-local" value={entry.endTime} onChange={e => handleBatchChange(entry.key, 'endTime', e.target.value)} className="w-full px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary" /></td>
                                <td className="p-2 align-top text-center"><button onClick={() => handleRemoveBatchRow(entry.key)} className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50" disabled={batchEntries.length <= 1}><TrashIcon /></button></td>
                            </tr>))}</tbody>
                        </table>
                    </div>
                    <button onClick={handleAddBatchRow} className="text-sm font-semibold text-primary hover:text-primary-dark">+ Add another line</button>
                    <div className="flex justify-end space-x-2 pt-4"><button onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button><button onClick={handleBatchSave} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark">Save All Entries</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default TimeLogPage;